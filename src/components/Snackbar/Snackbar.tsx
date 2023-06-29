import styles from "./Snackbar.module.css";
import cn from "classnames";
import { useEffect, useState } from "react";
import { uiAction, useAppDispatch, useAppSelector } from "../../store";

export function Snackbar() {
  const dispatch = useAppDispatch();
  const { status, text } = useAppSelector((s) => s.ui.snackbar);
  const [handle, setHandle] = useState<null | NodeJS.Timeout>(null);
  const [color, setColor] = useState<"error" | "success">("error");

  useEffect(() => {
    if (status) {
      setColor(status);
    }
  }, [status]);

  useEffect(() => {
    if (status) {
      if (!handle) {
        const handle = setTimeout(() => {
          dispatch(uiAction.setSnackbar({ status: null }));
        }, 10000);
        setHandle(handle);
      }
    } else {
      if (handle) {
        clearTimeout(handle);
      }
      setHandle(null);
    }
  }, [dispatch, handle, status]);

  return (
    <div
      className={cn(
        styles.snackbar,
        !status && styles.hidden,
        color === "error" && styles.error,
        color === "success" && styles.success
      )}
      onClick={() => dispatch(uiAction.setSnackbar({ status: null }))}
    >
      <p>{text}</p>
    </div>
  );
}
