import { Fragment, useCallback, useEffect } from "react";
import { uiAction, useAppDispatch, useAppSelector } from "../../store";

export function KeyboardListener() {
  const dispatch = useAppDispatch();
  const modal = useAppSelector((s) => s.ui.modal);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      console.log(e);
      if (e.key === "Escape") {
        if (modal) {
          dispatch(uiAction.showModal(null));
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch]);
  return <Fragment />;
}
