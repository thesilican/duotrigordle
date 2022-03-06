import { useEffect, useMemo, useState } from "react";
import { NUM_BOARDS, NUM_GUESSES, useSelector } from "../store";

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

type HeaderProps = {
  onShowHelp: () => void;
};
export default function Header(props: HeaderProps) {
  const id = useSelector((s) => s.id);
  const targets = useSelector((s) => s.targets);
  const guesses = useSelector((s) => s.guesses);
  const boardsCompleted = useMemo(
    () =>
      targets
        .map((target) => guesses.indexOf(target) !== -1)
        .reduce((a, v) => a + (v ? 1 : 0), 0),
    [targets, guesses]
  );
  const numGuesses = guesses.length;

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
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } else {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      }
    }
  };

  return (
    <div className="header">
      <div className="row-1">
        <div className="spacer"></div>
        <div className="spacer"></div>
        <p className="title">Daily Duotrigordle #{id}</p>
        <img
          className="help"
          src="help.svg"
          alt="Help"
          onClick={props.onShowHelp}
        />
        <img
          className="fullscreen"
          src={fullscreen ? "fullscreen-exit.svg" : "fullscreen.svg"}
          alt="Go Fullscreen"
          onClick={handleFullscreenClick}
        />
      </div>
      <div className="row-2">
        <p className="status">
          Boards Complete: {boardsCompleted}/{NUM_BOARDS}
        </p>
        <p>
          Guesses Used: {numGuesses}/{NUM_GUESSES}
        </p>
      </div>
    </div>
  );
}
