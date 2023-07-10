import styles from "./Snackbar.module.css";
import cn from "classnames";
import { useEffect, useState } from "react";
import { uiAction, useAppDispatch, useAppSelector } from "../../store";

export function Snackbar() {
  const dispatch = useAppDispatch();
  const { status, text } = useAppSelector((s) => s.ui.snackbar);
  const [handle, setHandle] = useState<null | NodeJS.Timeout>(null);
  const [uiStatus, setUiStatus] = useState<"error" | "success" | null>(status);
  const [uiText, setUiText] = useState(text);

  useEffect(() => {
    if (uiStatus !== status || uiText !== text) {
      setUiStatus(status);
      setUiText(text);
      if (status) {
        if (handle) {
          clearTimeout(handle);
        }
        const newHandle = setTimeout(() => {
          dispatch(uiAction.setSnackbar({ status: null }));
        }, 10000);
        setHandle(newHandle);
      } else {
        if (handle) {
          clearTimeout(handle);
        }
        setHandle(null);
      }
    }
  }, [dispatch, handle, status, text, uiStatus, uiText]);

  return (
    <div
      className={cn(
        styles.snackbar,
        status === null && styles.hidden,
        status === "error" && styles.error,
        status === "success" && styles.success
      )}
      onClick={() => dispatch(uiAction.setSnackbar({ status: null }))}
    >
      <p>{text}</p>
    </div>
  );
}
