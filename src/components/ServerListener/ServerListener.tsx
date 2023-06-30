import { Fragment, useEffect } from "react";
import { apiPostGameSave, apiPostStats } from "../../api";
import {
  selectNextSideEffect,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";

export function ServerListener() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.storage.account?.userId ?? null);
  const stats = useAppSelector((s) => s.stats.history);
  const sideEffect = useAppSelector(selectNextSideEffect);

  useEffect(() => {
    if (userId) {
      apiPostStats(dispatch, userId, stats);
    }
  }, [userId, stats, dispatch]);

  useEffect(() => {
    if (sideEffect?.type === "upload-game-save") {
      if (userId) {
        apiPostGameSave(
          dispatch,
          userId,
          sideEffect.challenge,
          sideEffect.gameSave
        );
      }
      dispatch(uiAction.resolveSideEffect(sideEffect.id));
    }
  }, [dispatch, userId, sideEffect]);

  return <Fragment />;
}
