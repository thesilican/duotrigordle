import { useEffect } from "react";
import { gameAction, useAppDispatch, useAppSelector } from "../../store";
import { Boards } from "../Boards/Boards";
import { Keyboard } from "../Keyboard/Keyboard";
import { Results } from "../Results/Results";

export function Game() {
  const gameOver = useAppSelector((s) => s.game.endTime !== null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Install hooks on window visibility change or unload
    // to pause or unpause the game
    // Pause the game when closing window
    const handleUnload = () => {
      dispatch(gameAction.pause({ timestamp: Date.now() }));
    };
    // Pause/unpause game when visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        dispatch(gameAction.pause({ timestamp: Date.now() }));
      } else {
        dispatch(gameAction.unpause({ timestamp: Date.now() }));
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch]);

  return (
    <>
      <Boards />
      {!gameOver ? <Keyboard /> : <Results />}
    </>
  );
}
