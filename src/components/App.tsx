import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { allWordsGuessed, NUM_GUESSES, startGame, useSelector } from "../store";
import Boards from "./Boards";
import Header from "./Header";
import Keyboard from "./Keyboard";
import Popup from "./Popup";
import Result from "./Result";
import cn from "classnames";

export default function App() {
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    dispatch(startGame({ id: 1 }));
  }, [dispatch]);

  const guessesUsedUp = useSelector((s) => s.guesses.length === NUM_GUESSES);
  const targets = useSelector((s) => s.targets);
  const guesses = useSelector((s) => s.guesses);
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
