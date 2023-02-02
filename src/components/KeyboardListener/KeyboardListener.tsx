import { Fragment, useEffect } from "react";
import {
  ALPHABET,
  gameAction,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";

export function KeyboardListener() {
  const dispatch = useAppDispatch();
  const view = useAppSelector((s) => s.ui.view);
  const modal = useAppSelector((s) => s.ui.modal);
  const gameOver = useAppSelector((s) => s.game.gameOver);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modal) {
          dispatch(uiAction.showModal(null));
        }
      }
      if (!modal && view === "game" && !gameOver) {
        if (ALPHABET.has(e.key.toUpperCase())) {
          dispatch(gameAction.inputLetter({ letter: e.key.toUpperCase() }));
        }
        if (e.key === "Backspace") {
          dispatch(gameAction.inputBackspace());
        }
        if (e.key === "Enter") {
          dispatch(gameAction.inputEnter({ timestamp: Date.now() }));
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, gameOver, modal, view]);
  return <Fragment />;
}
