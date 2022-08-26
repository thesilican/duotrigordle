import cn from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import fullscreenExitSvg from "../assets/fullscreen-exit.svg";
import fullscreenSvg from "../assets/fullscreen.svg";
import helpSvg from "../assets/help.svg";
import settingsSvg from "../assets/settings.svg";
import statsSvg from "../assets/stats.svg";
import { NUM_BOARDS, NUM_GUESSES } from "../consts";
import { formatTimeElapsed, MersenneTwister } from "../funcs";
import {
  showAboutPopup,
  showSettingsPopup,
  showStatsPopup,
  startGame,
  useSelector,
} from "../store";
import { loadGameFromLocalStorage } from "./LocalStorage";

// Declare typescript definitions for safari fullscreen stuff
declare global {
  interface Document {
    webkitFullscreenElement: Element | null;
    webkitExitFullscreen: () => void;
  }
  interface HTMLElement {
    webkitRequestFullscreen: () => void;
  }
}
function isFullscreen() {
  const element =
    document.fullscreenElement || document.webkitFullscreenElement;
  return Boolean(element);
}
function enterFullscreen() {
  const element = document.documentElement;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
}
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

export default function Header() {
  const dispatch = useDispatch();
  const id = useSelector((s) => s.game.id);
  const targets = useSelector((s) => s.game.targets);
  const guesses = useSelector((s) => s.game.guesses);
  const boardsCompleted = useMemo(
    () =>
      targets
        .map((target) => guesses.indexOf(target) !== -1)
        .reduce((a, v) => a + (v ? 1 : 0), 0),
    [targets, guesses]
  );
  const numGuesses = guesses.length;
  const practice = useSelector((s) => s.game.practice);
  const title = practice
    ? `Practice Duotrigordle`
    : `Daily Duotrigordle #${id}`;
  const gameOver = useSelector((s) => s.game.gameOver);
  const extraGuessesNum =
    NUM_GUESSES - NUM_BOARDS - (numGuesses - boardsCompleted);
  const cannotWin = extraGuessesNum < 0;
  const extraGuesses =
    extraGuessesNum > 0 ? "+" + extraGuessesNum : extraGuessesNum;

  // Refs so that the buttons are blurred on press
  // so that pressing enter again does not cause the
  // button to be activated again
  const practiceRef = useRef<HTMLButtonElement>(null);
  const newRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const handlePracticeClick = () => {
    practiceRef.current?.blur();
    const id = MersenneTwister().u32();
    dispatch(startGame({ id, practice: true }));
  };
  const handleNewClick = () => {
    newRef.current?.blur();
    const res = window.confirm(
      "Are you sure you want to start a new practice duotrigordle?\n" +
        "(Your current progress will be lost)"
    );
    if (!res) return;
    const id = MersenneTwister().u32();
    dispatch(startGame({ id, practice: true }));
  };
  const handleBackClick = () => {
    backRef.current?.blur();
    const res = window.confirm(
      "Are you sure you want to exit practice mode?\n" +
        "(Your current progress will be lost)"
    );
    if (!res) return;
    loadGameFromLocalStorage(dispatch);
  };

  // ctrl/cmd + shift + r keyboard shortcut to reset practice mode quickly
  const [reset, setReset] = useState(false);
  useEffect(() => {
    const handler = (k: KeyboardEvent) => {
      const useCmdKey = navigator.platform.match(/mac|iphone|ipad/i);
      if (
        practice &&
        k.key === "r" &&
        !k.shiftKey &&
        !k.altKey &&
        ((useCmdKey && !k.ctrlKey && k.metaKey) ||
          (!useCmdKey && k.ctrlKey && !k.metaKey))
      ) {
        k.preventDefault();
        const id = MersenneTwister().u32();
        dispatch(startGame({ id, practice: true }));
        setReset(true);
        setTimeout(() => setReset(false), 500);
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [dispatch, practice]);

  // Fullscreen
  const [fullscreen, setFullscreen] = useState(isFullscreen);
  useEffect(() => {
    const handler = () => {
      setFullscreen(isFullscreen);
    };
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);
  const handleFullscreenClick = () => {
    if (isFullscreen()) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  return (
    <div className="header">
      <div className="row-1">
        {practice ? (
          <>
            <button
              className="mode-switch"
              ref={backRef}
              onClick={handleBackClick}
            >
              Back
            </button>
            <button
              className="mode-switch"
              ref={newRef}
              onClick={handleNewClick}
            >
              New
            </button>
          </>
        ) : (
          <>
            <button
              className="mode-switch"
              ref={practiceRef}
              onClick={handlePracticeClick}
            >
              Practice
            </button>
            <div></div>
          </>
        )}
        <p className="title">{title}</p>
        <button className="icon" onClick={() => dispatch(showStatsPopup())}>
          <img src={statsSvg} alt="Stats" />
        </button>
        <button className="icon" onClick={() => dispatch(showAboutPopup())}>
          <img src={helpSvg} alt="Help" />
        </button>
        <button className="icon" onClick={() => dispatch(showSettingsPopup())}>
          <img src={settingsSvg} alt="Settings" />
        </button>
        <button className="icon" onClick={handleFullscreenClick}>
          <img
            src={fullscreen ? fullscreenExitSvg : fullscreenSvg}
            alt="Go Fullscreen"
          />
        </button>
      </div>
      <div className="row-2">
        <p>
          Boards Complete: {boardsCompleted}/{NUM_BOARDS}
        </p>
        <Timer showResetText={reset} />
        <p className={cn(cannotWin && !gameOver && "cannot-win")}>
          Guesses Used: {numGuesses}/{NUM_GUESSES} ({extraGuesses})
        </p>
      </div>
    </div>
  );
}

type TimerProps = {
  // Timer also used to show "NEW GAME text when using Ctrl+R"
  showResetText: boolean;
};
function Timer(props: TimerProps) {
  const showTimer = useSelector((s) => s.settings.showTimer);
  const startTime = useSelector((s) => s.game.startTime);
  const endTime = useSelector((s) => s.game.endTime);
  const gameStarted = useSelector((s) => s.game.guesses.length > 0);
  const gameOver = useSelector((s) => s.game.gameOver);
  const [now, setNow] = useState(() => new Date().getTime());

  const timeElapsed = useMemo(() => {
    if (!gameStarted) {
      return formatTimeElapsed(0);
    } else if (gameOver) {
      return formatTimeElapsed(endTime - startTime);
    } else {
      return formatTimeElapsed(now - startTime);
    }
  }, [startTime, endTime, gameStarted, now, gameOver]);

  useEffect(() => {
    if (!showTimer) return;
    const interval = setInterval(() => {
      setNow(() => new Date().getTime());
    }, 25);
    return () => clearInterval(interval);
  }, [showTimer]);

  if (props.showResetText) {
    return <p className="timer">New Game</p>;
  }
  if (!showTimer) {
    return <p />;
  }
  return <p className="timer">{timeElapsed}</p>;
}
