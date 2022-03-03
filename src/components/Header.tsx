import { useEffect, useMemo, useState } from "react";
import { NUM_BOARDS, NUM_GUESSES, useSelector } from "../store";

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

  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const handler = () => {
      setFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);
  const handleFullscreenClick = () => {
    if (fullscreen) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
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
