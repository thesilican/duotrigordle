import { Fragment, useLayoutEffect, useMemo, useState } from "react";
import { apiGetStats } from "../../api";
import {
  Challenge,
  GameMode,
  NUM_GUESSES,
  StatsEntry,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { formatTimeElapsed, range } from "../../util";
import { LinkButton } from "../common/LinkButton/LinkButton";
import { TabButtons } from "../common/TabButtons/TabButtons";
import styles from "./Stats.module.css";

export default function Stats() {
  const [gameModeTab, setGameModeTab] = useState(0);
  const [challengeTab, setChallengeTab] = useState(0);
  const localStats = useAppSelector((s) => s.stats.history);
  const userId = useAppSelector((s) => s.storage.account?.userId ?? null);
  const dispatch = useAppDispatch();
  const [serverStats, setServerStats] = useState<StatsEntry[] | null>(null);

  const stats = useMemo(
    () => [...localStats, ...(serverStats ?? [])],
    [localStats, serverStats]
  );

  useLayoutEffect(() => {
    if (!userId) {
      setServerStats([]);
      return;
    }
    apiGetStats(dispatch, userId).then((x) => {
      if (x) {
        setServerStats(x);
      }
    });
  }, [dispatch, userId]);

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
      <StatsInfo challenge={challenge} gameMode={gameMode} stats={stats} />
      <hr />
      <StatsExport stats={stats} />
    </div>
  );
}

type StatsInfoProps = {
  stats: StatsEntry[];
  challenge: Challenge;
  gameMode: GameMode;
};
function StatsInfo(props: StatsInfoProps) {
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
    timeCount,
    timeMax,
  } = calculateStatsInfo(props.stats);

  const rangeMin = props.challenge === "jumble" ? 35 : 32;
  const rangeMax = NUM_GUESSES[props.challenge];
  const bars: (number | null)[] = range(rangeMin, rangeMax + 1);
  bars.push(null);

  return (
    <div className={styles.statsContainer}>
      {props.gameMode === "daily" ? (
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
      <p>Guess Count</p>
      <div className={styles.chart}>
        {bars.map((i) => {
          const label = i === null ? "X" : i;
          const count = guessCount.get(i) ?? 0;
          const percent = guessMax === 0 ? 0 : count / guessMax;
          const width = percent === 0 ? "20px" : `${percent * 100}%`;
          return (
            <Fragment key={i}>
              <p>{label}</p>
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
      <p className={styles.title}>Time Distribution</p>
      <div className={styles.times}>
        <p>Best:</p>
        <p>{bestTime}</p>
        <p>Average (last 7):</p>
        <p>{avgTime7}</p>
        <p>Average (all):</p>
        <p>{avgTimeAll}</p>
      </div>
      <p>Time (minutes)</p>
      <div className={styles.chart}>
        {TIME_BUCKETS.map((i) => {
          const last = i === Infinity;
          const time = !last
            ? i / 60000
            : TIME_BUCKETS[TIME_BUCKETS.length - 2] / 60000;
          const label = (!last ? "<" : ">") + time;
          const count = timeCount.get(i) ?? 0;
          const percent = timeMax === 0 ? 0 : count / timeMax;
          const width = percent === 0 ? "20px" : `${percent * 100}%`;
          return (
            <Fragment key={i}>
              <p>{label}</p>
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
    </div>
  );
}

const TIME_BUCKETS = [
  1.0 * 60000,
  2.0 * 60000,
  3.0 * 60000,
  4.0 * 60000,
  5.0 * 60000,
  6.0 * 60000,
  7.0 * 60000,
  8.0 * 60000,
  9.0 * 60000,
  10.0 * 60000,
  12.0 * 60000,
  14.0 * 60000,
  16.0 * 60000,
  18.0 * 60000,
  20.0 * 60000,
  25.0 * 60000,
  30.0 * 60000,
  40.0 * 60000,
  50.0 * 60000,
  60.0 * 60000,
  Infinity,
];

function calculateStatsInfo(stats: StatsEntry[]) {
  const played = stats.length;
  const wonGames = stats.filter((x) => x.guesses !== null).length;
  const win = played === 0 ? 0 : ((wonGames / played) * 100).toFixed(0);

  // Get a list of all streak lengths
  const streaks = [];
  let prev: number | null = null;
  for (let i = 0; i < stats.length; i++) {
    const entry = stats[i];
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

  // Calculate streak stats
  const currStreak =
    streaks.length === 0 || stats[stats.length - 1].guesses === null
      ? 0
      : streaks[streaks.length - 1];
  const maxStreak = Math.max(0, ...streaks);

  // Calculate guess distribution
  const guessCount = new Map<number | null, number>();
  for (const entry of stats) {
    const key = entry.guesses;
    const count = guessCount.get(key) ?? 0;
    guessCount.set(key, count + 1);
  }
  const guessMax = Math.max(...guessCount.values());

  // Calculate best, average of 7, and average times
  const times = stats
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

  // Create times chart, bucket by minutes
  const timeCount = new Map<number, number>();
  for (const entry of stats) {
    if (!entry.guesses || !entry.time) {
      continue;
    }
    for (let i = 0; i < TIME_BUCKETS.length; i++) {
      if (entry.time < TIME_BUCKETS[i]) {
        const key = TIME_BUCKETS[i];
        const count = timeCount.get(key) ?? 0;
        timeCount.set(key, count + 1);
        break;
      }
    }
  }
  const timeMax = Math.max(...timeCount.values());

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
    timeCount,
    timeMax,
  };
}

type StatsExportProps = {
  stats: StatsEntry[];
};
function StatsExport(props: StatsExportProps) {
  const [isExpanded, setExpanded] = useState(false);

  const value = stringifyHistory(props.stats);

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

export function stringifyHistory(stats: StatsEntry[]): string {
  const lines = [];
  lines.push("Game Mode,Challenge,Id,Guesses,Time (ms)");
  for (const entry of stats) {
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
