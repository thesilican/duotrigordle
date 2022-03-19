import cn from "classnames";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { NUM_GUESSES } from "../consts";
import {
  allWordsGuessed,
  loadGameFromLocalStorage,
  saveGameToLocalStorage,
} from "../funcs";
import { useSelector } from "../store";
import Boards from "./Boards";
import Header from "./Header";
import Keyboard from "./Keyboard";
import Popup from "./Popup";
import Result from "./Result";

export default function App() {
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState(false);

  useLayoutEffect(() => {
    loadGameFromLocalStorage(dispatch);
  }, [dispatch]);

  const game = useSelector((s) => s.game);
  useEffect(() => {
    if (!game.practice) {
      saveGameToLocalStorage(game);
    }
  }, [game]);

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

  return (
    <>
      <div className={cn("game", gameWin && "win", gameLose && "lose")}>
        <Header onShowHelp={() => setShowPopup(true)} />
        <Boards />
        <Keyboard hidden={gameOver} />
        <Result hidden={!gameOver} />
      </div>
      <Popup hidden={!showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
}
