import cn from "classnames";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  allWordsGuessed,
  getTodaysId,
  isSerialized,
  loadState,
  NUM_GUESSES,
  serialize,
  startGame,
  useSelector,
} from "../store";
import Boards from "./Boards";
import Header from "./Header";
import Keyboard from "./Keyboard";
import Popup from "./Popup";
import Result from "./Result";

export default function App() {
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState(false);

  useLayoutEffect(() => {
    const todaysId = getTodaysId();
    const text = localStorage.getItem("duotrigordle-state");
    const serialized = text && JSON.parse(text);
    if (isSerialized(serialized) && serialized.id === todaysId) {
      dispatch(loadState({ serialized }));
    } else {
      dispatch(startGame({ id: todaysId, practice: false }));
    }
  }, [dispatch]);

  const state = useSelector((s) => s);
  useEffect(() => {
    if (!state.practice) {
      localStorage.setItem(
        "duotrigordle-state",
        JSON.stringify(serialize(state))
      );
    }
  }, [state]);

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
