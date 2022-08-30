import cn from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import fullscreenExitSvg from "../assets/fullscreen-exit.svg";
import fullscreenSvg from "../assets/fullscreen.svg";
import helpSvg from "../assets/help.svg";
import settingsSvg from "../assets/settings.svg";
import statsSvg from "../assets/stats.svg";
import { NUM_BOARDS, NUM_GUESSES } from "../consts";
import {
    enterFullscreen,
    exitFullscreen,
    formatTimeElapsed,
    getTodaysId,
    isFullscreen,
    randU32
} from "../funcs";
import {
    createSideEffect,
    selectCompletedBoards,
    showPopup,
    startGame,
    useSelector
} from "../store";
import { loadGameFromLocalStorage } from "./LocalStorage";

export default function Header() {
  return (
    <div className="header">
      <Row1 />
      <Row2 />
      <Row3 />
    </div>
  );
}

function Row1() {
  const dispatch = useDispatch();
  const id = useSelector((s) => s.game.id);
  const practice = useSelector((s) => s.game.practice);
  const [title, titleClass] = practice
    ? id < 99999
      ? [`Historical Duotrigordle #${id}`, "historical"]
      : [`Practice Duotrigordle`, "practice"]
    : [`Daily Duotrigordle #${id}`, null];

  // Refs so that the buttons are blurred on press
  // so that pressing enter again does not cause the
  // button to be activated again
  const practiceRef = useRef<HTMLButtonElement>(null);
  const newRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const histRef = useRef<HTMLButtonElement>(null);
  const handlePracticeClick = () => {
    practiceRef.current?.blur();
    dispatch(startGame({ id: randU32(), practice: true }));
  };

  const handleNewClick = () => {
    newRef.current?.blur();
    const res = window.confirm(
      "Are you sure you want to start a new Practice Duotrigordle?\n" +
        "(Pro-tip: You can also press Ctrl+R)"
    );
    if (!res) return;
    dispatch(startGame({ id: randU32(), practice: true }));
  };

  const handleHistClick = () => {
    histRef.current?.blur();
    const res = window.prompt(
      "Play a Historical Duotrigordle!\n" +
        "Enter a past Daily Duotrigordle # to play:"
    );
    if (res === null) return;
    const num = parseInt(res ?? "", 10);
    if (isNaN(num)) {
      alert("Please enter a number");
    } else if (num < getTodaysId()) {
      dispatch(startGame({ id: num, practice: true }));
    } else if (num >= 99999) {
      // Allow numbers greater than 99999 for people that want to play with duotrigordle practice seed
      alert(
        `Starting Practice Duotrigordle with seed ${num}\n` +
          `(Note: you can set a Practice Duotrigordle seed ≥100000)`
      );
      dispatch(startGame({ id: num, practice: true }));
    } else {
      alert("Please enter a past Daily Duotrigordle #");
    }
  };

  const handleBackClick = () => {
    backRef.current?.blur();
    const res = window.confirm("Are you sure you want to exit practice mode?");
    if (!res) return;
    loadGameFromLocalStorage(dispatch);
  };

  // Fullscreen
  const [fullscreen, setFullscreen] = useState(isFullscreen);
  useEffect(() => {
    const handler = () => setFullscreen(isFullscreen);
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
            ref={histRef}
            onClick={handleHistClick}
          >
            Hist
          </button>
          <button className="mode-switch" ref={newRef} onClick={handleNewClick}>
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
          <div />
          <div />
        </>
      )}
      <p className={cn("title", titleClass)}>{title}</p>
      <button className="icon" onClick={() => dispatch(showPopup("stats"))}>
        <img src={statsSvg} alt="Stats" />
      </button>
      <button className="icon" onClick={() => dispatch(showPopup("about"))}>
        <img src={helpSvg} alt="Help" />
      </button>
      <button className="icon" onClick={() => dispatch(showPopup("settings"))}>
        <img src={settingsSvg} alt="Settings" />
      </button>
      <button className="icon" onClick={handleFullscreenClick}>
        <img
          src={fullscreen ? fullscreenExitSvg : fullscreenSvg}
          alt="Go Fullscreen"
        />
      </button>
    </div>
  );
}

function Row2() {
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
  const gameOver = useSelector((s) => s.game.gameOver);
  const extraGuessesNum =
    NUM_GUESSES - NUM_BOARDS - (numGuesses - boardsCompleted);
  const cannotWin = extraGuessesNum < 0;
  const extraGuesses =
    extraGuessesNum > 0 ? "+" + extraGuessesNum : extraGuessesNum;

  return (
    <div className="row-2">
      <p>
        Boards Complete: {boardsCompleted}/{NUM_BOARDS}
      </p>
      <Timer />
      <p className={cn(cannotWin && !gameOver && "cannot-win")}>
        Guesses Used: {numGuesses}/{NUM_GUESSES} ({extraGuesses})
      </p>
    </div>
  );
}

function Timer() {
  const dispatch = useDispatch();
  const showTimer = useSelector((s) => s.settings.showTimer);
  const startTime = useSelector((s) => s.game.startTime);
  const endTime = useSelector((s) => s.game.endTime);
  const gameStarted = useSelector((s) => s.game.guesses.length > 0);
  const gameOver = useSelector((s) => s.game.gameOver);
  const practice = useSelector((s) => s.game.practice);
  const [now, setNow] = useState(() => new Date().getTime());

  const timerText = useMemo(() => {
    if (!showTimer) {
      return "";
    } else if (!gameStarted) {
      return formatTimeElapsed(0);
    } else if (gameOver) {
      return formatTimeElapsed(endTime - startTime);
    } else {
      return formatTimeElapsed(now - startTime);
    }
  }, [now, showTimer, startTime, endTime, gameStarted, gameOver]);

  useEffect(() => {
    if (!showTimer) return;
    const interval = setInterval(() => {
      setNow(() => new Date().getTime());
    }, 25);
    return () => clearInterval(interval);
  }, [showTimer]);

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
        dispatch(startGame({ id: randU32(), practice: true }));
        setReset(true);
        setTimeout(() => setReset(false), 500);
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [dispatch, practice]);

  return <p className="timer">{reset ? "New Game" : timerText}</p>;
}

function Row3() {
  const dispatch = useDispatch();
  const boardsCompleted = useSelector(selectCompletedBoards);
  return (
    <div className="row-3">
      {boardsCompleted.map((complete, i) => (
        <button
          key={i}
          className={cn("chip", complete && "complete")}
          onClick={() =>
            dispatch(
              createSideEffect({
                type: "scroll-board-into-view",
                board: i,
              })
            )
          }
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
