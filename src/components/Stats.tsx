import cn from "classnames";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { PRACTICE_MODE_MIN_ID } from "../consts";
import { formatTimeElapsed, parseTimeElapsed, range } from "../funcs";
import {
  GameEntry,
  normalizeHistory,
  setHistory,
  showPopup,
  StatsState,
  useSelector,
} from "../store";

export default function Stats() {
  const dispatch = useDispatch();
  const shown = useSelector((s) => s.ui.popup === "stats");
  const stats = useSelector((s) => s.stats);
  const {
    played,
    win,
    currStreak,
    maxStreak,
    guessCount,
    guessStyle,
    bestTime,
    avgTime7,
    avgTimeAll,
  } = useMemo(() => calculateStatsInfo(stats), [stats]);

  return (
    <div className={cn("popup-wrapper", !shown && "hidden")}>
      <div className="popup">
        <p className="stats-title">Statistics</p>
        <div className="stats-grid">
          <p className="value">{played}</p>
          <p className="value">{win}</p>
          <p className="value">{currStreak}</p>
          <p className="value">{maxStreak}</p>
          <p className="label">Played</p>
          <p className="label">Win %</p>
          <p className="label">
            Current
            <br />
            Streak
          </p>
          <p className="label">
            Max
            <br />
            Streak
          </p>
        </div>
        <p className="stats-title">Guess Distribution</p>
        <div className="stats-chart">
          {range(6).map((i) => (
            <Fragment key={i}>
              <p>{i + 32}</p>
              <div className="bar-wrapper">
                <div className="bar" style={{ width: guessStyle[i] }}>
                  <p>{guessCount[i]}</p>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
        <p className="stats-title">Times</p>
        <div className="stats-times">
          <p>Best Time:</p>
          <p>{bestTime}</p>
          <p>Average Time (last 7):</p>
          <p>{avgTime7}</p>
          <p>Average Time (all):</p>
          <p>{avgTimeAll}</p>
        </div>
        <StatsEditor />
        <button className="close" onClick={() => dispatch(showPopup(null))}>
          close
        </button>
      </div>
    </div>
  );
}

function calculateStatsInfo(stats: StatsState) {
  const history = stats.history;
  const played = history.length;
  const wonGames = history.filter((x) => x.guesses !== null).length;
  const win = played === 0 ? 0 : ((wonGames / played) * 100).toFixed(0);

  // Get a list of all streak lengths
  const streaks = [];
  let prev: number | null = null;
  for (let i = 0; i < history.length; i++) {
    if (history[i].guesses === null) {
      continue;
    }
    if (prev !== null && history[i].id === prev + 1) {
      streaks[streaks.length - 1]++;
    } else {
      streaks.push(1);
    }
    prev = history[i].id;
  }

  const currStreak =
    history.length === 0 || history[history.length - 1].guesses === null
      ? 0
      : streaks[streaks.length - 1];
  const maxStreak = Math.max(0, ...streaks);

  // Calculate guess distribution
  const guessCount = [];
  for (let i = 0; i < 6; i++) {
    const count = history.filter((x) => x.guesses === i + 32).length;
    guessCount.push(count);
  }
  const guessMax = Math.max(...guessCount);
  const guessStyle = guessCount.map((count) => {
    const percent = guessMax === 0 ? 0 : count / guessMax;
    const width = Math.max(5, percent * 100);
    return `${width.toFixed(0)}%`;
  });

  // Calculate best, average of 7, and average times
  const times = history
    .filter((x) => x.guesses !== null && x.time !== null)
    .map((x) => x.time!);
  let bestTime, avgTime7, avgTimeAll;
  if (times.length === 0) {
    bestTime = avgTime7 = avgTimeAll = formatTimeElapsed(0);
  } else {
    bestTime = formatTimeElapsed(Math.min(...times));
    const sumTimesAll = times.reduce((a, v) => a + v);
    avgTimeAll = formatTimeElapsed(sumTimesAll / times.length);
    const times7 = times.slice(-7);
    const sumTimes7 = times7.reduce((a, v) => a + v);
    avgTime7 = formatTimeElapsed(sumTimes7 / times7.length);
  }

  return {
    played,
    win,
    currStreak,
    maxStreak,
    guessCount,
    guessStyle,
    bestTime,
    avgTime7,
    avgTimeAll,
  };
}

function StatsEditor() {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");
  const [modified, setModified] = useState(false);
  const dispatch = useDispatch();
  const history = useSelector((s) => s.stats.history);

  function handleExpand() {
    const res = window.confirm(
      "Are you sure you want to edit your duotrigordle statistics?\n" +
        "(This is intended for people who have been tracking statistics themselves " +
        "before they were added, or for people that have run into bugs)"
    );
    if (!res) return;

    setExpanded(true);
    setValue(stringifyHistory(history));
    setModified(false);
  }

  function handleClose() {
    if (modified) {
      const res = window.confirm(
        "Are you sure you want to leave? (you have unsubmitted changes)"
      );
      if (!res) return;
    }
    setExpanded(false);
  }

  function handleSubmit() {
    if (!modified) {
      alert("No changes to submit");
      return;
    }
    const parsedHistory = parseHistory(value);
    if (typeof parsedHistory === "string") {
      alert(parsedHistory);
    } else {
      const res = window.confirm(
        "Are you sure you want to submit these changes? (they cannot be undone)"
      );
      if (!res) return;
      dispatch(setHistory(parsedHistory));
      setValue(stringifyHistory(parsedHistory));
      setModified(false);
    }
  }

  function handleReset() {
    if (!modified) {
      alert("No changes to reset");
      return;
    }
    const res = window.confirm("Are you sure you want to undo any changes?");
    if (!res) return;
    setValue(stringifyHistory(history));
    setModified(false);
  }

  return (
    <div className={cn("stats-editor", expanded && "expanded")}>
      {expanded ? (
        <div className="buttons">
          <button className="link" onClick={handleSubmit}>
            Submit
          </button>
          <button className="link" onClick={handleReset}>
            Reset
          </button>
          <a
            href="https://github.com/thesilican/duotrigordle/tree/main/docs/Inputting_Stats.md"
            target="_blank"
            rel="noreferrer"
          >
            Help
          </a>
          <div />
          <button className="link" onClick={handleClose}>
            Close
          </button>
        </div>
      ) : (
        <div className="buttons">
          <button className="link edit" onClick={handleExpand}>
            Edit
          </button>
          <a
            href="https://github.com/thesilican/duotrigordle/tree/main/docs/Inputting_Stats.md"
            target="_blank"
            rel="noreferrer"
          >
            Help
          </a>
        </div>
      )}
      <textarea
        className="editor"
        rows={10}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setModified(true);
        }}
      />
      <p className="hint">
        Format: <code>id guesses time</code>
        <br />
        <code>id</code> - Game ID
        <br />
        <code>guesses</code> - Number of guesses or "X"
        <br />
        <code>time</code> - Time elapsed or "-"
      </p>
    </div>
  );
}

function stringifyHistory(history: GameEntry[]): string {
  history = normalizeHistory(history);
  const lines = [];
  for (const stat of history) {
    const id = stat.id;
    const guesses = stat.guesses ?? "X";
    const time = stat.time === null ? "-" : formatTimeElapsed(stat.time);
    const line = `${id} ${guesses} ${time}`;
    lines.push(line);
  }
  return lines.join("\n");
}

function parseHistory(text: string): GameEntry[] | string {
  const history: GameEntry[] = [];
  if (text.trim() === "") {
    return [];
  }
  const lines = text
    .trim()
    .split("\n")
    .map((x) => x.trim());
  const ids = new Set();
  for (let i = 0; i < lines.length; i++) {
    // Format: <id> <guesses> <time>
    // id is a positive integer
    // guesses is an integer or "X"
    // time is a positive real number or "-" for untimed
    const match = lines[i].match(/^(\d+)\s+(\d+|X)\s+([\d.:-]+)$/);
    if (!match) {
      return `Line ${i + 1} invalid syntax: "${lines[i]}"`;
    }

    const id = parseInt(match[1], 10);
    const guesses = match[2] === "X" ? null : parseInt(match[2], 10);
    const time = parseTimeElapsed(match[3]);

    if (id <= 0 || id >= PRACTICE_MODE_MIN_ID) {
      return `Line ${i + 1} has invalid id ("${lines[i]}")`;
    }
    if (ids.has(id)) {
      return `Line ${i + 1} has duplicate id ("${lines[i]}")`;
    } else {
      ids.add(id);
    }
    if (guesses !== null && (guesses < 32 || guesses > 37)) {
      return (
        `Line ${i + 1} has invalid guess count, ` +
        `must be "X" or 32-37 ("${lines[i]}")`
      );
    }
    if (time !== null && time <= 0) {
      return (
        `Line ${i + 1} has invalid time format, ` +
        `must be a non-zero amount of time ` +
        `("${lines[i]}")`
      );
    }
    if (time === null && match[3] !== "-") {
      return (
        `Line ${i + 1} has invalid time format, ` +
        `must be "-" or formatted like 00:00.00 ` +
        `("${lines[i]}")`
      );
    }

    history.push({ id, guesses, time });
  }
  return history;
}
