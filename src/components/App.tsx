import cn from "classnames";
import { useEffect, useLayoutEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { NUM_GUESSES } from "../consts";
import {
  allWordsGuessed,
  loadGameFromLocalStorage,
  loadSettingsFromLocalStorage,
  saveGameToLocalStorage,
  saveSettingsToLocalStorage,
} from "../funcs";
import { useSelector } from "../store";
import About from "./About";
import Boards from "./Boards";
import Header from "./Header";
import Keyboard from "./Keyboard";
import Result from "./Result";
import { Settings } from "./Settings";

export default function App() {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    loadGameFromLocalStorage(dispatch);
    loadSettingsFromLocalStorage(dispatch);
  }, [dispatch]);

  const game = useSelector((s) => s.game);
  useEffect(() => {
    if (!game.practice) {
      saveGameToLocalStorage(game);
    }
  }, [game]);

  const settings = useSelector((s) => s.settings);
  useEffect(() => {
    saveSettingsToLocalStorage(settings);
  }, [settings]);

  const guessesUsedUp = useSelector(
    (s) => s.game.guesses.length === NUM_GUESSES
  );
  const targets = useSelector((s) => s.game.targets);
  const guesses = useSelector((s) => s.game.guesses);
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
    </>
  );
}
