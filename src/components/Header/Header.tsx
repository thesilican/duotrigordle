import cn from "classnames";
import { useEffect, useMemo, useState } from "react";
import backIcon from "../../assets/back.svg";
import fullscreenExitIcon from "../../assets/fullscreen-exit.svg";
import fullscreenIcon from "../../assets/fullscreen.svg";
import logoIcon from "../../assets/logo.svg";
import restartIcon from "../../assets/restart.svg";
import settingsIcon from "../../assets/settings.svg";
import {
  gameAction,
  getCompletedBoards,
  getCompletedBoardsCount,
  NUM_BOARDS,
  NUM_GUESSES,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { assertNever, formatTimeElapsed, range } from "../../util";
import { AdBox } from "../AdBox/AdBox";
import { Button } from "../common/Button/Button";
import styles from "./Header.module.css";

export function Header() {
  const view = useAppSelector((s) => s.ui.path.view);
  const wideMode = useAppSelector((s) => s.settings.wideMode);
  const colorBlind = useAppSelector((s) => s.settings.colorBlindMode);
  const disableAnimations = useAppSelector((s) => s.settings.disableAnimations);

  return (
    <div
      className={cn(
        styles.header,
        view === "welcome" && styles.welcome,
        view === "game" && styles.game,
        wideMode && styles.wide,
        colorBlind && styles.colorBlind,
        disableAnimations && styles.disableAnimations
      )}
    >
      <AdBox />
      <Row1 />
      <Row2 />
      <Row3 />
    </div>
  );
}

function Row1() {
  const dispatch = useAppDispatch();
  const { fullscreen, toggleFullscreen } = useFullscreen();
  const view = useAppSelector((s) => s.ui.path.view);
  const gameMode = useAppSelector((s) => s.game.gameMode);
  const gameId = useAppSelector((s) => s.game.id);
  const challenge = useAppSelector((s) => s.game.challenge);
  const showRestart = view === "game" && gameMode !== "daily";

  const handleBackClick = () => {
    if (view === "game" && gameMode !== "daily") {
      const res = window.confirm(
        "Are you sure you want to quit your current game?"
      );
      if (!res) return;
    }
    dispatch(
      uiAction.navigate({
        to: { view: "welcome" },
        timestamp: Date.now(),
      })
    );
  };

  const handleRestartClick = () => {
    const res = window.confirm(
      "Are you sure you want to restart your current game? (You can also use ctrl+r)"
    );
    if (!res) return;
    dispatch(gameAction.restart({ timestamp: Date.now() }));
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement?.blur();
    }
  };

  const renderTitle = () => {
    if (view === "welcome") {
      return "Duotrigordle";
    } else if (view === "game") {
      if (challenge === "perfect") {
        return "Perfect Challenge";
      }
      const gameModeText =
        gameMode === "daily"
          ? "Daily"
          : gameMode === "practice"
          ? "Practice"
          : gameMode === "historic"
          ? "Historic"
          : "?????";
      const challengeText =
        challenge === "normal"
          ? "Duotrigordle"
          : challenge === "jumble"
          ? "Jumble"
          : challenge === "sequence"
          ? "Sequence"
          : "??????";
      const gameNumber =
        gameMode === "daily" || gameMode === "historic" ? ` #${gameId}` : "";
      return `${gameModeText} ${challengeText}${gameNumber}`;
    } else if (view === "privacy-policy") {
      return "Privacy Policy";
    } else if (view === "how-to-play") {
      return "How to play";
    } else if (view === "stats") {
      return "Stats";
    } else if (view === "account") {
      return "Account";
    } else {
      assertNever(view);
    }
  };

  return (
    <div className={styles.row1}>
      <Button
        className={cn(styles.icon, view === "welcome" && styles.hidden)}
        onClick={handleBackClick}
      >
        <img
          className={styles.img}
          src={backIcon}
          alt="back"
          title="Back to Homepage"
        />
      </Button>
      <Button
        className={cn(styles.icon, !showRestart && styles.hidden)}
        onClick={handleRestartClick}
      >
        <img
          className={styles.img}
          src={restartIcon}
          alt="restart"
          title="Restart Game"
        />
      </Button>
      <div className={styles.titleWrapper}>
        <div className={styles.title}>
          {view === "welcome" ? (
            <img src={logoIcon} width={30} height={30} alt="Logo" />
          ) : null}
          <span className={styles.text}>{renderTitle()}</span>
        </div>
      </div>
      <Button
        className={styles.icon}
        onClick={() => dispatch(uiAction.showModal("settings"))}
      >
        <img
          className={styles.img}
          src={settingsIcon}
          alt="settings"
          title="Settings"
        />
      </Button>
      <Button className={styles.icon} onClick={toggleFullscreen}>
        <img
          className={styles.img}
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
  const gameOver = useAppSelector((s) => s.game.endTime !== null);
  const boardsCompleted = useMemo(
    () => getCompletedBoardsCount(targets, guesses),
    [guesses, targets]
  );
  const challenge = useAppSelector((s) => s.game.challenge);
  const numGuesses = guesses.length;
  const maxGuesses = NUM_GUESSES[challenge];
  const extraGuessesNum =
    maxGuesses - NUM_BOARDS - (numGuesses - boardsCompleted);
  const cannotWin = extraGuessesNum < 0;
  const extraGuesses =
    extraGuessesNum > 0 ? "+" + extraGuessesNum : extraGuessesNum;

  return (
    <div className={styles.row2}>
      <span>
        Boards: {boardsCompleted}/{NUM_BOARDS}
      </span>
      <Timer />
      <span className={cn(cannotWin && !gameOver && styles.red)}>
        Guesses: {numGuesses}/{maxGuesses} ({extraGuesses})
      </span>
    </div>
  );
}

function Timer() {
  const showTimer = useAppSelector((s) => s.settings.showTimer);
  const startTime = useAppSelector((s) => s.game.startTime);
  const endTime = useAppSelector((s) => s.game.endTime);
  const pauseTime = useAppSelector((s) => s.game.pauseTime);
  const [now, setNow] = useState(() => Date.now());

  const timerText = useMemo(() => {
    if (!showTimer) {
      return "";
    } else if (startTime === null) {
      return formatTimeElapsed(0);
    } else if (endTime !== null) {
      return formatTimeElapsed(endTime - startTime);
    } else if (pauseTime !== null) {
      return "PAUSED";
    } else {
      return formatTimeElapsed(now - startTime);
    }
  }, [showTimer, startTime, endTime, pauseTime, now]);

  useEffect(() => {
    if (!showTimer) return;
    const interval = setInterval(() => {
      setNow(() => Date.now());
    }, 25);
    return () => clearInterval(interval);
  }, [showTimer]);

  return <span className={styles.timer}>{timerText}</span>;
}

function Row3() {
  const dispatch = useAppDispatch();
  const targets = useAppSelector((s) => s.game.targets);
  const guesses = useAppSelector((s) => s.game.guesses);
  const highlightedBoard = useAppSelector((s) => s.game.highlightedBoard);
  const boardsCompleted = useMemo(
    () => getCompletedBoards(targets, guesses),
    [targets, guesses]
  );

  return (
    <div className={styles.row3}>
      {range(NUM_BOARDS).map((i) => (
        <button
          key={i}
          className={cn(
            styles.chip,
            boardsCompleted[i]
              ? styles.green
              : highlightedBoard === i
              ? styles.white
              : null
          )}
          onClick={() =>
            dispatch(
              uiAction.createSideEffect({
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
