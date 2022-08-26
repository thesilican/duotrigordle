import cn from "classnames";
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { NUM_GUESSES } from "../consts";
import { allWordsGuessed } from "../funcs";
import { addHistory, useSelector } from "../store";
import About from "./About";
import Boards from "./Boards";
import Header from "./Header";
import Keyboard from "./Keyboard";
import LocalStorage from "./LocalStorage";
import Result from "./Result";
import { Settings } from "./Settings";
import Stats from "./Stats";

export default function App() {
  const dispatch = useDispatch();

  const targets = useSelector((s) => s.game.targets);
  const guesses = useSelector((s) => s.game.guesses);
  const guessesUsedUp = guesses.length === NUM_GUESSES;
  const gameWin = useMemo(
    () => allWordsGuessed(guesses, targets),
    [guesses, targets]
  );
  const gameOver = guessesUsedUp || gameWin;
  const gameLose = guessesUsedUp && !gameWin;
  const colorBlindMode = useSelector((s) => s.settings.colorBlindMode);
  const wideMode = useSelector((s) => s.settings.wideMode);
  const hideCompletedBoards = useSelector(
    (s) => s.settings.hideCompletedBoards
  );
  const animateHiding = useSelector((s) => s.settings.animateHiding);
  const stats = useSelector((s) => s.stats);
  const game = useSelector((s) => s.game);

  // Add to stat history if game over and not already in history
  useEffect(() => {
    if (
      gameOver &&
      !game.practice &&
      !stats.history.find((v) => v.id === game.id)
    ) {
      let guesses;
      if (gameWin) {
        guesses = game.guesses.length;
      } else {
        guesses = null;
      }
      const time = game.endTime - game.startTime;
      dispatch(addHistory({ id: game.id, guesses, time }));
    }
  }, [
    dispatch,
    game.endTime,
    game.startTime,
    game.guesses.length,
    game.id,
    game.practice,
    gameOver,
    gameWin,
    stats.history,
  ]);

  // Prevent duotrigordle form working in iframes
  // (looking at you https://dordle.io/duotrigordle)
  if (window.top !== window) {
    return (
      <p>
        Play duotrigordle at{" "}
        <a href="https://duotrigordle.com" target="_blank" rel="noreferrer">
          https://duotrigordle.com
        </a>{" "}
        (if you are seeing this message, the website you're playing on probably
        stole this game and/or is making ad revenue)
      </p>
    );
  }

  return (
    <>
      <div
        className={cn(
          "game",
          gameWin && "win",
          gameLose && "lose",
          colorBlindMode && "color-blind",
          wideMode && "wide",
          hideCompletedBoards &&
            !(gameWin || gameLose) &&
            "hide-completed-boards",
          animateHiding && "animate-hiding"
        )}
      >
        <Header />
        <Boards />
        <Keyboard hidden={gameOver} />
        <Result hidden={!gameOver} />
      </div>
      <About />
      <Settings />
      <Stats />
      <LocalStorage />
    </>
  );
}
