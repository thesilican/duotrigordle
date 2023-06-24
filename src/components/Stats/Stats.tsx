import { Fragment, useState } from "react";
import {
  Challenge,
  GameMode,
  HistoryEntry,
  normalizeHistory,
  StatsState,
  useAppSelector,
} from "../../store";
import { formatTimeElapsed, range } from "../../util";
import { LinkButton } from "../common/LinkButton/LinkButton";
import { Modal } from "../common/Modal/Modal";
import { TabButtons } from "../common/TabButtons/TabButtons";
import styles from "./Stats.module.css";

export default function Stats() {
  const shown = useAppSelector((s) => s.ui.modal === "stats");
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
    <Modal shown={shown}>
      <p className={styles.title}>Statistics</p>
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
        size="tiny"
      />
      <StatsInfo gameMode={gameMode} challenge={challenge} />
      <hr />
      <StatsExport />
    </Modal>
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
    guessStyle,
    bestTime,
    avgTime7,
    avgTimeAll,
  } = calculateStatsInfo(stats, gameMode, challenge);

  const [rangeMin, rangeMax] =
    challenge === "perfect"
      ? [32, 32]
      : challenge === "jumble"
      ? [35, 37]
      : [32, 37];

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
        {range(rangeMin, rangeMax + 1).map((i) => (
          <Fragment key={i}>
            <p>{i}</p>
            <div className={styles.barWrapper}>
              <div className={styles.bar} style={{ width: guessStyle[i - 32] }}>
                <div className={styles.barColor} />
                <p>{guessCount[i - 32]}</p>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
      <p className={styles.title}>Times</p>
      <div className={styles.times}>
        <p>Best Time:</p>
        <p>{formatTimeElapsed(bestTime)}</p>
        <p>Average Time (last 7):</p>
        <p>{formatTimeElapsed(avgTime7)}</p>
        <p>Average Time (all):</p>
        <p>{formatTimeElapsed(avgTimeAll)}</p>
      </div>
    </div>
  );
}

export function calculateStatsInfo(
  stats: StatsState,
  gameMode: GameMode,
  challenge: Challenge
) {
  const history = stats.history.filter(
    (x) => x.challenge === challenge && x.gameMode === gameMode
  );
  const played = history.length;
  const wonGames = history.filter((x) => x.guesses !== null).length;
  const win = played === 0 ? 0 : Math.round((wonGames / played) * 100);

  // Get a list of all streak lengths
  let currStreak = null,
    maxStreak = null;
  if (gameMode === "daily") {
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

    if (streaks.length === 0) {
      currStreak = 0;
    } else if (history[history.length - 1].guesses === null) {
      currStreak = 0;
    } else {
      currStreak = streaks[streaks.length - 1];
    }
    maxStreak = Math.max(0, ...streaks);
  }

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
    bestTime = avgTime7 = avgTimeAll = 0;
  } else {
    bestTime = Math.min(...times);
    const sumTimesAll = times.reduce((a, v) => a + v);
    avgTimeAll = sumTimesAll / times.length;
    const times7 = times.slice(-7);
    const sumTimes7 = times7.reduce((a, v) => a + v);
    avgTime7 = sumTimes7 / times7.length;
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
            onFocus={(e) => e.currentTarget.select()}
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
  lines.push("Game Mode,Challenge,Id,Guesses,Time (ms)");
  for (const entry of history) {
    const line = [];
    line.push(entry.gameMode);
    line.push(entry.challenge);
    line.push(entry.id);
    line.push(entry.guesses);
    line.push(entry.time);
    lines.push(line.join(","));
  }
  return lines.join("\n");
}
