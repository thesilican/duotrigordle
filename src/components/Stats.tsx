import cn from "classnames";
import { Fragment, useMemo } from "react";
import { useDispatch } from "react-redux";
import { formatTimeElapsed, range } from "../funcs";
import {
  addHistory,
  GameHistory,
  removeHistory,
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

  function formatHistory(history: GameHistory[]) {
    const msg = [];
    for (const game of history) {
      const id = game.id;
      const guesses = game.guesses ?? "X";
      const time = formatTimeElapsed(game.time);
      msg.push(`- Daily #${id} ${guesses}/37 ${time}`);
    }
    return msg.join("\n");
  }
  function handleAddClick() {
    let input, val;
    while (true) {
      while (true) {
        input = prompt("Enter Daily Duotrigordle #");
        if (!input) return;
        val = parseFloat(input);
        if (Number.isInteger(val) && val >= 1) {
          break;
        }
        alert("Please enter a positive integer");
      }
      const id = val;
      while (true) {
        input = prompt(
          'Enter number of guesses taken in the game (or "X" if failed)'
        );
        if (!input) return;
        if (input.toLowerCase() === "x") {
          val = null;
          break;
        }
        val = parseFloat(input);
        if (Number.isInteger(val) && 32 <= val && val <= 37) {
          break;
        }
        alert('Please enter "X" or an integer between 32-37');
      }
      const guesses = val;
      while (true) {
        input = prompt(
          "Enter number of seconds taken to complete the game (can be fractional)"
        );
        if (!input) return;
        val = parseFloat(input);
        if (val > 0) {
          break;
        }
        alert("Please enter a positive number");
      }
      const time = val * 1000;
      dispatch(addHistory({ id, guesses, time }));
      alert(
        `Added game:\n` +
          `Daily #${id} ${guesses ?? "X"}/37 ${formatTimeElapsed(time)}`
      );
    }
  }
  function handleRemoveClick() {
    const removed: number[] = [];
    while (true) {
      if (stats.history.length === 0) {
        alert("There are no games to remove");
        return;
      }
      const input = prompt(
        "Enter Daily # for the game you would like to remove:\n" +
          formatHistory(stats.history.filter((x) => !removed.includes(x.id)))
      );
      if (!input) return;
      const val = parseFloat(input);
      if (!Number.isInteger(val) || val < 1) {
        alert("Please enter a positive integer");
        continue;
      }
      dispatch(removeHistory({ id: val }));
      removed.push(val);
    }
  }
  function handleListClick() {
    const val = window.confirm(
      "Press OK to copy history to clipboard\n" +
        "Games History:\n" +
        formatHistory(stats.history)
    );
    if (val) {
      // setTimeout otherwise we get "DOMException: Document is not focused."
      setTimeout(
        () =>
          navigator.clipboard
            .writeText(formatHistory(stats.history))
            .catch(() => alert("Error copying to clipboard")),
        200
      );
    }
  }

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
        <div className="stats-import">
          <button className="link" onClick={handleAddClick}>
            Add
          </button>
          <button className="link" onClick={handleRemoveClick}>
            Remove
          </button>
          <button className="link" onClick={handleListClick}>
            List
          </button>
          <a
            href="https://github.com/thesilican/duotrigordle/tree/main/docs/Inputting_Stats.md"
            target="_blank"
            rel="noreferrer"
          >
            Help
          </a>
        </div>
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

  const streaks = [];
  if (history.length > 0) {
    streaks.push(1);
    let prev = history[0].id;
    for (let i = 1; i < history.length; i++) {
      if (history[i].guesses === null) {
        continue;
      }
      if (history[i].id === prev + 1) {
        streaks[streaks.length - 1]++;
      } else {
        streaks.push(1);
      }
      prev = history[i].id;
    }
  }
  const currStreak =
    history.length === 0 || history[history.length - 1].guesses === null
      ? 0
      : streaks[streaks.length - 1];
  const maxStreak = Math.max(0, ...streaks);
  const guessCount = [];
  for (let i = 0; i < 6; i++) {
    const count = history.filter((x) => x.guesses === i + 32).length;
    guessCount.push(count);
  }
  const guessMax = Math.max(...guessCount);
  const guessStyle = [];
  for (const count of guessCount) {
    const percent = guessMax === 0 ? 0 : count / guessMax;
    const width = Math.max(5, percent * 100);
    const style = `${width.toFixed(0)}%`;
    guessStyle.push(style);
  }

  const times = history.filter((x) => x.guesses !== null).map((x) => x.time);
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
