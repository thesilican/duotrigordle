import { Fragment, useEffect } from "react";
import { GET_USER, apiFetch } from "../../api";
import {
  selectNextSideEffect,
  storageAction,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";

export function ServerListener() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.storage.account?.userId);
  const sideEffect = useAppSelector(selectNextSideEffect);

  useEffect(() => {
    if (sideEffect?.type === "fetch-user") {
      if (userId) {
        apiFetch(GET_USER, { user_id: userId }).then((x) => {
          if (x.success) {
            dispatch(
              storageAction.updateAccount({
                userId: x.data.user.user_id,
                email: x.data.user.email,
                username: x.data.user.username,
              })
            );
          } else {
            dispatch(storageAction.logout());
            dispatch(
              uiAction.setSnackbar({
                status: "error",
                text: "Error loading user: " + x.message,
              })
            );
          }
        });
      }
      dispatch(uiAction.resolveSideEffect(sideEffect.id));
    }
  }, [dispatch, sideEffect, userId]);
  return <Fragment />;
}
