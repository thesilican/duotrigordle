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
  const view = useAppSelector((s) => s.ui.path.view);
  const modal = useAppSelector((s) => s.ui.modal);
  const gameMode = useAppSelector((s) => s.game.gameMode);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (modal) {
        if (e.key === "Escape") {
          dispatch(uiAction.showModal(null));
        }
      } else if (!modal && view === "game") {
        if (e.key === "r" && (e.ctrlKey || e.metaKey) && gameMode !== "daily") {
          dispatch(gameAction.restart({ timestamp: Date.now() }));
          e.preventDefault();
        } else if (ALPHABET.has(e.key.toUpperCase())) {
          dispatch(gameAction.inputLetter({ letter: e.key.toUpperCase() }));
        } else if (e.key === "Backspace") {
          dispatch(gameAction.inputBackspace());
        } else if (e.key === "Enter") {
          dispatch(gameAction.inputEnter({ timestamp: Date.now() }));
        } else if (e.key === "Escape") {
          dispatch(gameAction.highlightEsc());
        } else if (e.key === "ArrowLeft") {
          dispatch(gameAction.highlightArrow({ direction: "left" }));
          e.preventDefault();
        } else if (e.key === "ArrowRight") {
          dispatch(gameAction.highlightArrow({ direction: "right" }));
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, modal, view, gameMode]);
  return <Fragment />;
}
