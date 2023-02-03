import cn from "classnames";
import { useEffect, useMemo, useState } from "react";
import aboutIcon from "../../assets/about.svg";
import backIcon from "../../assets/back.svg";
import fullscreenExitIcon from "../../assets/fullscreen-exit.svg";
import fullscreenIcon from "../../assets/fullscreen.svg";
import restartIcon from "../../assets/restart.svg";
import settingsIcon from "../../assets/settings.svg";
import statsIcon from "../../assets/stats.svg";
import logoIcon from "../../assets/logo.svg";
import {
  gameAction,
  getCompletedBoards,
  loadGameFromLocalStorage,
  NUM_BOARDS,
  NUM_GUESSES,
  PRACTICE_MODE_MIN_ID,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { formatTimeElapsed } from "../../util";
import { AdBox } from "../AdBox/AdBox";
import { Button } from "../common/Button/Button";
import styles from "./Header.module.css";
const {
  header,
  hidden,
  icon,
  img,
  red,
  row1,
  row2,
  timer,
  title,
  titleWrapper,
  welcome,
  text,
} = styles;

export function Header() {
  const isWelcome = useAppSelector((s) => s.ui.view === "welcome");

  return (
    <div className={cn(isWelcome && welcome, header)}>
      <AdBox />
      <Row1 />
      <Row2 />
    </div>
  );
}

function Row1() {
  const dispatch = useAppDispatch();
  const { fullscreen, toggleFullscreen } = useFullscreen();
  const isGameView = useAppSelector((s) => s.ui.view === "game");
  const isPractice = useAppSelector((s) => s.game.practice);
  const gameId = useAppSelector((s) => s.game.id);
  const gameMode = useAppSelector((s) => s.game.gameMode);
  const showRestart = isGameView && isPractice;

  const handleBackClick = () => {
    if (isPractice) {
      const res = window.confirm(
        "Are you sure you want to quick your practice game?"
      );
      if (!res) return;
      loadGameFromLocalStorage(dispatch);
    }
    dispatch(uiAction.setView("welcome"));
  };

  const handleRestartClick = () => {
    const res = window.confirm(
      "Are you sure you want to restart your practice game? (You can also use ctrl+r)"
    );
    if (res) {
      dispatch(gameAction.restart({ timestamp: Date.now() }));
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement?.blur();
      }
    }
  };

  const renderTitle = () => {
    if (!isGameView) {
      return "Duotrigordle";
    } else {
      const gameModeText =
        gameMode === "normal"
          ? "Duotrigordle"
          : gameMode === "jumble"
          ? "Jumble"
          : gameMode === "sequence"
          ? "Sequence"
          : "??????";
      if (isPractice) {
        if (gameId < PRACTICE_MODE_MIN_ID) {
          return `Historic Duotrigordle #${gameId}`;
        } else {
          return `Practice ${gameModeText}`;
        }
      } else {
        return `Daily ${gameModeText} #${gameId}`;
      }
    }
  };

  return (
    <div className={row1}>
      <Button
        className={cn(icon, !isGameView && hidden)}
        onClick={handleBackClick}
      >
        <img
          className={img}
          src={backIcon}
          alt="back"
          title="Back to Homepage"
        />
      </Button>
      <Button
        className={cn(icon, !showRestart && hidden)}
        onClick={handleRestartClick}
      >
        <img
          className={img}
          src={restartIcon}
          alt="restart"
          title="Restart Game"
        />
      </Button>
      <div className={titleWrapper}>
        <div className={title}>
          {!isGameView ? (
            <img src={logoIcon} width={30} height={30} alt="Logo" />
          ) : null}
          <span className={text}>{renderTitle()}</span>
        </div>
      </div>
      <Button
        className={icon}
        onClick={() => dispatch(uiAction.showModal("stats"))}
      >
        <img
          className={img}
          src={statsIcon}
          alt="statistics"
          title="Statistics"
        />
      </Button>
      <Button
        className={icon}
        onClick={() => dispatch(uiAction.showModal("about"))}
      >
        <img className={img} src={aboutIcon} alt="about" title="About" />
      </Button>
      <Button
        className={icon}
        onClick={() => dispatch(uiAction.showModal("settings"))}
      >
        <img
          className={img}
          src={settingsIcon}
          alt="settings"
          title="Settings"
        />
      </Button>
      <Button className={icon} onClick={toggleFullscreen}>
        <img
          className={img}
          src={fullscreen ? fullscreenExitIcon : fullscreenIcon}
          alt="toggle fullscreen"
          title="Toggle Fullscreen"
        />
      </Button>
    </div>
  );
}

function Row2() {
  const targets = useAppSelector((s) => s.game.targets);
  const guesses = useAppSelector((s) => s.game.guesses);
  const gameOver = useAppSelector((s) => s.game.gameOver);
  const boardsCompleted = useMemo(
    () =>
      getCompletedBoards(targets, guesses).reduce((a, v) => a + (v ? 1 : 0), 0),
    [targets, guesses]
  );
  const numGuesses = guesses.length;
  const extraGuessesNum =
    NUM_GUESSES - NUM_BOARDS - (numGuesses - boardsCompleted);
  const cannotWin = extraGuessesNum < 0;
  const extraGuesses =
    extraGuessesNum > 0 ? "+" + extraGuessesNum : extraGuessesNum;

  return (
    <div className={row2}>
      <span>
        Boards: {boardsCompleted}/{NUM_BOARDS}
      </span>
      <Timer />
      <span className={cn(cannotWin && !gameOver && red)}>
        Guesses: {numGuesses}/{NUM_GUESSES} ({extraGuesses})
      </span>
    </div>
  );
}

function Timer() {
  const showTimer = useAppSelector((s) => s.settings.showTimer);
  const startTime = useAppSelector((s) => s.game.startTime);
  const endTime = useAppSelector((s) => s.game.endTime);
  const gameStarted = useAppSelector((s) => s.game.guesses.length > 0);
  const gameOver = useAppSelector((s) => s.game.gameOver);
  const [now, setNow] = useState(() => Date.now());

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
      setNow(() => Date.now());
    }, 25);
    return () => clearInterval(interval);
  }, [showTimer]);

  return <span className={timer}>{timerText}</span>;
}

// Type declarations for fullscreen stuff
declare global {
  interface Document {
    webkitFullscreenElement: Element | null;
    webkitExitFullscreen: () => void;
  }
  interface HTMLElement {
    webkitRequestFullscreen: () => void;
  }
}

function useFullscreen() {
  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
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
  function toggleFullscreen() {
    if (fullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }

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

  return { fullscreen, enterFullscreen, exitFullscreen, toggleFullscreen };
}
