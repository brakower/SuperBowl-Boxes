import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearEntry,
  selectBox,
  setDigits,
  setEntries,
  setEntry,
} from "./boxesSlice";
import { supabase } from "./supabaseClient";
import type { RootState } from "./store";
import "./App.css";

const GRID_SIZE = 10;

const getRowCol = (index: number) => {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  return { row, col };
};

const formatDigit = (digit: number | null) => (digit === null ? "—" : digit);

type BoxRow = { id: number; name: string | null };
type DigitSettingsRow = {
  id: number;
  row_digits: unknown;
  col_digits: unknown;
};
type BoxesPayload = {
  new?: Partial<BoxRow>;
  old?: Partial<BoxRow>;
  eventType?: string;
};
type DigitsPayload = {
  new?: Partial<DigitSettingsRow>;
};

const normalizeDigits = (value: unknown) => {
  if (!Array.isArray(value)) {
    return Array.from({ length: GRID_SIZE }, () => null);
  }
  return value.map((digit) =>
    typeof digit === "number" && Number.isFinite(digit) ? digit : null,
  );
};

const shuffleDigits = () => {
  const digits = Array.from({ length: GRID_SIZE }, (_, i) => i);
  for (let i = digits.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
};

function App() {
  const dispatch = useDispatch();
  const entries = useSelector((state: RootState) => state.boxes.entries);
  const selectedIndex = useSelector(
    (state: RootState) => state.boxes.selectedIndex,
  );
  const rowDigits = useSelector((state: RootState) => state.boxes.rowDigits);
  const colDigits = useSelector((state: RootState) => state.boxes.colDigits);

  const [homeTeam, setHomeTeam] = useState("Patriots (AFC)");
  const [awayTeam, setAwayTeam] = useState("Seahawks (NFC)");
  const [pendingName, setPendingName] = useState("");

  const selectedName = useMemo(() => {
    if (selectedIndex === null) {
      return "";
    }
    return entries[selectedIndex] ?? "";
  }, [entries, selectedIndex]);

  const hasSupabase = Boolean(supabase);

  useEffect(() => {
    setPendingName(selectedName);
  }, [selectedName]);

  useEffect(() => {
    const client = supabase;
    if (!hasSupabase || !client) {
      return undefined;
    }

    let isMounted = true;

    const loadInitial = async () => {
      const { data: boxRows, error: boxError } = await client
        .from("boxes")
        .select("id, name")
        .order("id", { ascending: true });

      const typedBoxRows = boxRows as BoxRow[] | null;
      if (!boxError && typedBoxRows && isMounted) {
        const nextEntries = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => "");
        typedBoxRows.forEach((row) => {
          if (typeof row.id === "number" && row.id >= 0 && row.id < nextEntries.length) {
            nextEntries[row.id] = row.name ?? "";
          }
        });
        dispatch(setEntries(nextEntries));
      }

      const { data: settings } = await client
        .from("digit_settings")
        .select("row_digits, col_digits")
        .eq("id", 1)
        .maybeSingle();

      const typedSettings = settings as DigitSettingsRow | null;
      if (typedSettings && isMounted) {
        dispatch(
          setDigits({
            rowDigits: normalizeDigits(typedSettings.row_digits),
            colDigits: normalizeDigits(typedSettings.col_digits),
          }),
        );
      }
    };

    loadInitial();

    const boxesChannel = client
      .channel("boxes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "boxes" },
        (payload: BoxesPayload) => {
          const rowId = payload.new?.id ?? payload.old?.id;
          if (typeof rowId !== "number") {
            return;
          }

          if (payload.eventType === "DELETE") {
            dispatch(clearEntry(rowId));
            return;
          }

          dispatch(setEntry({ index: rowId, name: payload.new?.name ?? "" }));
        },
      )
      .subscribe();

    const digitsChannel = client
      .channel("digits-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "digit_settings" },
        (payload: DigitsPayload) => {
          dispatch(
            setDigits({
              rowDigits: normalizeDigits(payload.new?.row_digits),
              colDigits: normalizeDigits(payload.new?.col_digits),
            }),
          );
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      client.removeChannel(boxesChannel);
      client.removeChannel(digitsChannel);
    };
  }, [dispatch, hasSupabase]);

  const selectedInfo = useMemo(() => {
    if (selectedIndex === null) {
      return null;
    }
    const { row, col } = getRowCol(selectedIndex);
    return {
      row,
      col,
      rowDigit: rowDigits[row],
      colDigit: colDigits[col],
    };
  }, [colDigits, rowDigits, selectedIndex]);

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-text">
          <p className="eyebrow">Superbowl Boxes</p>
          <h1>Claim a square. Track the score. Win quick cash.</h1>
          <p className="subhead">
            Pick a square in the grid. Once digits are randomized,
            match the last digit of each team’s score to win quarter prizes.   $10 per box must be sent to @benny-rak on Venmo with the caption "SuperBowl Box" or your box will be
              removed.
          </p>
        </div>
        <div className="hero-panel">
          <div className="team-inputs">
            <label>
              Away Team
              <input
                value={awayTeam}
                onChange={(event) => setAwayTeam(event.target.value)}
                placeholder="Away"
              />
            </label>
            <label>
              Home Team
              <input
                value={homeTeam}
                onChange={(event) => setHomeTeam(event.target.value)}
                placeholder="Home"
              />
            </label>
          </div>
          <div className="panel-actions">
            <button
              className="primary"
              onClick={async () => {
                const nextRowDigits = shuffleDigits();
                const nextColDigits = shuffleDigits();
                dispatch(setDigits({ rowDigits: nextRowDigits, colDigits: nextColDigits }));

                if (supabase) {
                  await supabase
                    .from("digit_settings")
                    .upsert({
                      id: 1,
                      row_digits: nextRowDigits,
                      col_digits: nextColDigits,
                    });
                }
              }}
              disabled
            >
              Randomize Digits
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="board">
          <div className="scorebar">
            <div className="team-tag away">
              <span className="label">Away</span>
              <strong>{awayTeam || "Away"}</strong>
            </div>
            <div className="scorebar-center">
              <span className="score-dot" />
              <span className="score-dot" />
              <span className="score-dot" />
            </div>
            <div className="team-tag home">
              <span className="label">Home</span>
              <strong>{homeTeam || "Home"}</strong>
            </div>
          </div>

          <div className="grid" role="grid" aria-label="Superbowl boxes">
            <div className="corner">Last Digit</div>
            {colDigits.map((digit, colIndex) => (
              <div key={`col-${colIndex}`} className="digit-label">
                {formatDigit(digit)}
              </div>
            ))}
            {rowDigits.map((rowDigit, rowIndex) => (
              <div key={`row-${rowIndex}`} className="row">
                <div className="digit-label row-label">
                  {formatDigit(rowDigit)}
                </div>
                {colDigits.map((colDigit, colIndex) => {
                  const index = rowIndex * GRID_SIZE + colIndex;
                  const name = entries[index];
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={`cell-${rowIndex}-${colIndex}`}
                      type="button"
                      className={`cell ${isSelected ? "selected" : ""} ${
                        name ? "claimed" : ""
                      }`}
                      onClick={() => dispatch(selectBox(index))}
                    >
                      <span className="cell-meta">
                        {formatDigit(rowDigit)}-{formatDigit(colDigit)}
                      </span>
                      <span className="cell-name">
                        {name ? name : "Tap to claim"}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <aside className="sidebar">

          <div className="card">
            <h3>Payment</h3>
            <p className="muted">
              $10 per box must be sent to @benny-rak on Venmo with the caption "SuperBowl Box" or your box will be
              removed.
            </p>
            <ul className="muted">
              <li>1Q score: $150</li>
              <li>3Q score: $150</li>
              <li>Halftime: $200</li>
              <li>Final: $400</li>
            </ul>
          </div>


          <div className="card">
            <h2>Claim a Box</h2>
            {selectedInfo ? (
              <p className="muted">
                Selected: Row {selectedInfo.row + 1}, Column {selectedInfo.col + 1}
                · Digits {formatDigit(selectedInfo.rowDigit)}-
                {formatDigit(selectedInfo.colDigit)}
              </p>
            ) : (
              <p className="muted">Select a square to enter your name.</p>
            )}

            <label className="field">
              Name
              <input
                value={pendingName}
                onChange={(event) => setPendingName(event.target.value)}
                placeholder="Your name"
                disabled={selectedIndex === null}
              />
            </label>
            <div className="panel-actions">
              <button
                className="primary"
                onClick={async () => {
                  if (selectedIndex === null) {
                    return;
                  }
                  const trimmed = pendingName.trim();
                  dispatch(setEntry({ index: selectedIndex, name: trimmed }));

                  if (supabase) {
                    await supabase
                      .from("boxes")
                      .upsert({ id: selectedIndex, name: trimmed });
                  }
                }}
                disabled={selectedIndex === null}
              >
                Save Name
              </button>
              <button
                className="ghost"
                onClick={async () => {
                  if (selectedIndex === null) {
                    return;
                  }
                  dispatch(clearEntry(selectedIndex));

                  if (supabase) {
                    await supabase
                      .from("boxes")
                      .delete()
                      .eq("id", selectedIndex);
                  }
                }}
                disabled={selectedIndex === null}
              >
                Clear Box
              </button>
            </div>
          </div>

          <div className="card tips">
            <h3>How it Works</h3>
            <ol>
              <li>Claim a square with your name.</li>
              <li>Benny wil randomize the digits for each team once all boxes have been claimed.</li>
              <li>Cheer on your score to win.</li>
            </ol>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
