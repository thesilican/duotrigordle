import { Fragment, useState } from "react";
import {
  Challenge,
  GameMode,
  HistoryEntry,
  normalizeHistory,
  NUM_GUESSES,
  StatsState,
  useAppSelector,
} from "../../store";
import { formatTimeElapsed, range } from "../../util";
import { LinkButton } from "../common/LinkButton/LinkButton";
import { TabButtons } from "../common/TabButtons/TabButtons";
import styles from "./Stats.module.css";

export default function Stats() {
  const [gameModeTab, setGameModeTab] = useState(0);
  const [challengeTab, setChallengeTab] = useState(0);

  function handleGameModeTabChange(idx: number) {
    setGameModeTab(idx);
    if (idx === 0 && challengeTab > 2) {
      setChallengeTab(0);
    }
  }

  const gameMode =
    gameModeTab === 0 ? "daily" : gameModeTab === 1 ? "practice" : "daily";

  const challenge =
    challengeTab === 0
      ? "normal"
      : challengeTab === 1
      ? "sequence"
      : challengeTab === 2
      ? "jumble"
      : challengeTab === 3
      ? "perfect"
      : "normal";

  return (
    <div className={styles.main}>
      <div className={styles.tabs}>
        <TabButtons
          tabs={["Daily", "Practice"]}
          idx={gameModeTab}
          onTabChange={handleGameModeTabChange}
          size="small"
        />
        <TabButtons
          tabs={
            gameModeTab === 0
              ? ["Normal", "Sequence", "Jumble"]
              : ["Normal", "Sequence", "Jumble", "Perfect"]
          }
          idx={challengeTab}
          onTabChange={setChallengeTab}
          size="small"
        />
      </div>
      <StatsInfo gameMode={gameMode} challenge={challenge} />
      <hr />
      <StatsExport />
    </div>
  );
}

type StatsInfoProps = {
  gameMode: GameMode;
  challenge: Challenge;
};
function StatsInfo({ challenge, gameMode }: StatsInfoProps) {
  const stats = useAppSelector((s) => s.stats);
  const {
    played,
    win,
    currStreak,
    maxStreak,
    guessCount,
    guessMax,
    bestTime,
    avgTime7,
    avgTimeAll,
  } = calculateStatsInfo(stats, gameMode, challenge);

  const rangeMin = challenge === "jumble" ? 35 : 32;
  const rangeMax = NUM_GUESSES[challenge];

  return (
    <div className={styles.statsContainer}>
      {gameMode === "daily" ? (
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
      ) : (
        <div className={styles.grid}>
          <div />
          <p className={styles.value}>{played}</p>
          <p className={styles.value}>{win}</p>
          <div />
          <div />
          <p className={styles.label}>Played</p>
          <p className={styles.label}>Win %</p>
          <div />
        </div>
      )}
      <p className={styles.title}>Guess Distribution</p>
      <div className={styles.chart}>
        {range(rangeMin, rangeMax + 1).map((i) => {
          const count = guessCount.get(i) ?? 0;
          const percent = guessMax === 0 ? 0 : count / guessMax;
          const width = percent === 0 ? "20px" : `${percent * 100}%`;
          return (
            <Fragment key={i}>
              <p>{i}</p>
              <div className={styles.barWrapper}>
                <div className={styles.bar} style={{ width }}>
                  <div className={styles.barColor} />
                  <p>{count}</p>
                </div>
              </div>
            </Fragment>
          );
        })}
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
    </div>
  );
}

function calculateStatsInfo(
  stats: StatsState,
  gameMode: GameMode,
  challenge: Challenge
) {
  const history = stats.history.filter(
    (x) => x.challenge === challenge && x.gameMode === gameMode
  );
  const played = history.length;
  const wonGames = history.filter((x) => x.guesses !== null).length;
  const win = played === 0 ? 0 : ((wonGames / played) * 100).toFixed(0);

  // Get a list of all streak lengths
  const streaks = [];
  let prev: number | null = null;
  for (let i = 0; i < history.length; i++) {
    const entry = history[i];
    if (entry.guesses === null || entry.gameMode !== "daily") {
      continue;
    }
    if (prev !== null && entry.id === prev + 1) {
      streaks[streaks.length - 1]++;
    } else {
      streaks.push(1);
    }
    prev = entry.id;
  }

  const currStreak =
    streaks.length === 0 || history[history.length - 1].guesses === null
      ? 0
      : streaks[streaks.length - 1];
  const maxStreak = Math.max(0, ...streaks);

  // Calculate guess distribution
  const guessCount = new Map();
  for (const entry of history) {
    if (entry.guesses !== null) {
      const count = guessCount.get(entry.guesses) ?? 0;
      guessCount.set(entry.guesses, count + 1);
    }
  }
  const guessMax = Math.max(...guessCount.values());

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
    guessMax,
    bestTime,
    avgTime7,
    avgTimeAll,
  };
}

function StatsExport() {
  const [isExpanded, setExpanded] = useState(false);
  const history = useAppSelector((s) => s.stats.history);

  const value = stringifyHistory(history);

  return (
    <div className={styles.exportContainer}>
      {isExpanded ? (
        <>
          <LinkButton onClick={() => setExpanded(false)}>Close</LinkButton>
          <textarea
            className={styles.export}
            rows={10}
            value={value}
            readOnly
            onClick={(e) => e.currentTarget.select()}
          />
        </>
      ) : (
        <>
          <LinkButton onClick={() => setExpanded(true)}>Export</LinkButton>
        </>
      )}
    </div>
  );
}

export function stringifyHistory(history: HistoryEntry[]): string {
  history = normalizeHistory(history);
  const lines = [];
  for (const entry of history) {
    const id = entry.gameMode === "daily" ? entry.id : "P";
    const challenge =
      entry.challenge === "normal"
        ? "N"
        : entry.challenge === "sequence"
        ? "S"
        : entry.challenge === "jumble"
        ? "J"
        : entry.challenge === "perfect"
        ? "P"
        : undefined;
    const guesses = entry.guesses ?? "X";
    const time = entry.time === null ? "-" : formatTimeElapsed(entry.time);
    const line = `${id} ${challenge} ${guesses} ${time}`;
    lines.push(line);
  }
  return lines.join("\n");
}
