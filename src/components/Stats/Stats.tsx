import cn from "classnames";
import { Fragment, useMemo, useState } from "react";
import {
  Challenge,
  HistoryEntry,
  normalizeHistory,
  PRACTICE_MODE_MIN_ID,
  statsAction,
  StatsState,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { formatTimeElapsed, parseTimeElapsed, range } from "../../util";
import { LinkButton } from "../common/LinkButton/LinkButton";
import { Modal } from "../common/Modal/Modal";
import { TabButtons } from "../common/TabButtons/TabButtons";
import styles from "./Stats.module.css";

export default function Stats() {
  const shown = useAppSelector((s) => s.ui.modal === "stats");
  const stats = useAppSelector((s) => s.stats);
  const [tabIdx, setTabIdx] = useState(0);
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
  } = useMemo(() => {
    const challenge =
      tabIdx === 0
        ? "normal"
        : tabIdx === 1
        ? "sequence"
        : tabIdx === 2
        ? "jumble"
        : "normal";
    return calculateStatsInfo(stats, challenge);
  }, [stats, tabIdx]);

  return (
    <Modal shown={shown}>
      <div className={styles.statsContainer}>
        <p className={styles.title}>Statistics</p>
        <TabButtons
          tabs={["Normal", "Sequence", "Jumble"]}
          idx={tabIdx}
          onTabChange={setTabIdx}
          size="small"
        />
        <div className={styles.grid}>
          <p className={styles.value}>{played}</p>
          <p className={styles.value}>{win}</p>
          <p className={styles.value}>{currStreak}</p>
          <p className={styles.value}>{maxStreak}</p>
          <p className={styles.label}>Played</p>
          <p className={styles.label}>Win %</p>
          <p className={styles.label}>
            Current
            <br />
            Streak
          </p>
          <p className={styles.label}>
            Max
            <br />
            Streak
          </p>
        </div>
        <p className={styles.title}>Guess Distribution</p>
        <div className={styles.chart}>
          {range(6).map((i) => (
            <Fragment key={i}>
              <p>{i + 32}</p>
              <div className={styles.barWrapper}>
                <div className={styles.bar} style={{ width: guessStyle[i] }}>
                  <div className={styles.barColor} />
                  <p>{guessCount[i]}</p>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
        <p className={styles.title}>Times</p>
        <div className={styles.times}>
          <p>Best Time:</p>
          <p>{bestTime}</p>
          <p>Average Time (last 7):</p>
          <p>{avgTime7}</p>
          <p>Average Time (all):</p>
          <p>{avgTimeAll}</p>
        </div>
        <hr />
        <StatsEditor />
      </div>
    </Modal>
  );
}

function calculateStatsInfo(stats: StatsState, challenge: Challenge) {
  const history = stats.history.filter((x) => x.challenge === challenge);
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
    // Add 3% to account for text
    const width = Math.max(5, percent * 100) + 3;
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
  const [isExpanded, setExpanded] = useState(false);
  const [value, setValue] = useState("");
  const [modified, setModified] = useState(false);
  const dispatch = useAppDispatch();
  const history = useAppSelector((s) => s.stats.history);

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
      dispatch(statsAction.setHistory(parsedHistory));
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
    <div className={cn(styles.editorContainer, isExpanded && styles.expanded)}>
      {isExpanded ? (
        <div className={styles.buttons}>
          <LinkButton onClick={handleSubmit}>Submit</LinkButton>
          <LinkButton onClick={handleReset}>Reset</LinkButton>
          <a
            href="https://github.com/thesilican/duotrigordle/tree/main/docs/Inputting_Stats.md"
            target="_blank"
            rel="noreferrer"
          >
            Help
          </a>
          <div className={styles.spacer} />
          <LinkButton onClick={handleClose}>Close</LinkButton>
        </div>
      ) : (
        <div className={styles.buttons}>
          <LinkButton onClick={handleExpand}>Edit</LinkButton>
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
        className={styles.editor}
        rows={10}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setModified(true);
        }}
      />
      <p className={styles.hint}>
        Format: <code>id challenge guesses time</code>
        <br />
        <code>id</code> - Game ID
        <br />
        <code>challenge</code> - &quot;N&quot; for normal, &quot;S&quot; for
        sequence, &quot;J&quot; for jumble
        <br />
        <code>guesses</code> - Number of guesses or &quot;X&quot;
        <br />
        <code>time</code> - Time elapsed or &quot;-&quot;
      </p>
    </div>
  );
}

export function stringifyHistory(history: HistoryEntry[]): string {
  history = normalizeHistory(history);
  const lines = [];
  for (const stat of history) {
    const id = stat.id;
    const challenge =
      stat.challenge === "normal"
        ? "N"
        : stat.challenge === "sequence"
        ? "S"
        : stat.challenge === "jumble"
        ? "J"
        : stat.challenge === "perfect"
        ? "P"
        : undefined;
    const guesses = stat.guesses ?? "X";
    const time = stat.time === null ? "-" : formatTimeElapsed(stat.time);
    const line = `${id} ${challenge} ${guesses} ${time}`;
    lines.push(line);
  }
  return lines.join("\n");
}

export function parseHistory(text: string): HistoryEntry[] | string {
  const history: HistoryEntry[] = [];
  if (text.trim() === "") {
    return [];
  }
  const lines = text
    .trim()
    .split("\n")
    .map((x) => x.trim());
  for (let i = 0; i < lines.length; i++) {
    // Format: <id> <challenge> <guesses> <time>
    // id is a positive integer
    // challenge is "N", "S", "J", or "P"
    // guesses is an integer or "X"
    // time is a time format or "-" for untimed
    const match = lines[i].match(/^(\d+)\s+([a-zA-Z])\s+(\d+|X)\s+([\d.:-]+)$/);
    if (!match) {
      return `Line ${i + 1} invalid syntax: "${lines[i]}"`;
    }

    const id = parseInt(match[1], 10);
    const challenge =
      match[2].toUpperCase() === "N"
        ? "normal"
        : match[2].toUpperCase() === "S"
        ? "sequence"
        : match[2].toUpperCase() === "J"
        ? "jumble"
        : match[2].toUpperCase() === "P"
        ? "perfect"
        : null;
    const guesses = match[3] === "X" ? null : parseInt(match[3], 10);
    const time = parseTimeElapsed(match[4]);

    if (id <= 0 || id >= PRACTICE_MODE_MIN_ID) {
      return `Line ${i + 1} has invalid id ("${lines[i]}")`;
    }
    if (challenge === null) {
      return `Line ${i + 1} has invalid challenge, must be "N", "S", or "J")`;
    }
    if (history.find((x) => x.challenge === challenge && x.id === id)) {
      return `Line ${i + 1} has duplicate challenge and id ("${lines[i]}")`;
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
    if (time === null && match[4] !== "-") {
      return (
        `Line ${i + 1} has invalid time format, ` +
        `must be "-" or formatted like 00:00.00 ` +
        `("${lines[i]}")`
      );
    }

    history.push({ id, guesses, time, challenge });
  }
  return history;
}
