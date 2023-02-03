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
  const practice = useAppSelector((s) => s.game.practice);
  const gameOver = useAppSelector((s) => s.game.gameOver);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (modal) {
        if (e.key === "Escape") {
          dispatch(uiAction.showModal(null));
        }
      } else if (!modal && view === "game" && !gameOver) {
        if (e.key === "r" && (e.ctrlKey || e.metaKey) && practice) {
          dispatch(gameAction.restart({ timestamp: Date.now() }));
          e.preventDefault();
        } else if (ALPHABET.has(e.key.toUpperCase())) {
          dispatch(gameAction.inputLetter({ letter: e.key.toUpperCase() }));
        } else if (e.key === "Backspace") {
          dispatch(gameAction.inputBackspace());
        } else if (e.key === "Enter") {
          dispatch(gameAction.inputEnter({ timestamp: Date.now() }));
        } else if (e.key === "ArrowLeft") {
          dispatch(uiAction.highlightArrowLeft());
          e.preventDefault();
        } else if (e.key === "ArrowRight") {
          dispatch(uiAction.highlightArrowRight());
          e.preventDefault();
        } else if (e.key === "ArrowUp") {
          dispatch(uiAction.highlightArrowUp());
          e.preventDefault();
        } else if (e.key === "ArrowDown") {
          dispatch(uiAction.highlightArrowDown());
          e.preventDefault();
        } else if (e.key === "Escape") {
          dispatch(uiAction.highlightEsc());
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, gameOver, modal, view, practice]);
  return <Fragment />;
}
