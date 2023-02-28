import { Fragment, useEffect, useLayoutEffect, useState } from "react";
import {
  savesAction,
  settingsAction,
  statsAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import {
  loadFromLocalStorage,
  STORAGE_KEY_SAVES,
  parseSaves,
  STORAGE_KEY_SETTINGS,
  parseSettings,
  STORAGE_KEY_STATS,
  parseStats,
  saveToLocalStorage,
} from "./storage";

export function LocalStorage() {
  const dispatch = useAppDispatch();
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    if (!loaded) {
      const saves = loadFromLocalStorage(STORAGE_KEY_SAVES, parseSaves);
      if (saves) {
        dispatch(savesAction.load(saves));
      }
      const settings = loadFromLocalStorage(
        STORAGE_KEY_SETTINGS,
        parseSettings
      );
      if (settings) {
        dispatch(settingsAction.update(settings));
      }
      const stats = loadFromLocalStorage(STORAGE_KEY_STATS, parseStats);
      if (stats) {
        dispatch(statsAction.load(stats));
      }
      setLoaded(true);
    }
  }, [dispatch, loaded]);

  const saves = useAppSelector((s) => s.saves);
  useEffect(() => {
    if (loaded) {
      saveToLocalStorage(STORAGE_KEY_SAVES, saves);
    }
  }, [saves, loaded]);
  const settings = useAppSelector((s) => s.settings);
  useEffect(() => {
    if (loaded) {
      saveToLocalStorage(STORAGE_KEY_SETTINGS, settings);
    }
  }, [settings, loaded]);
  const stats = useAppSelector((s) => s.stats);
  useEffect(() => {
    if (loaded) {
      saveToLocalStorage(STORAGE_KEY_STATS, stats);
    }
  }, [stats, loaded]);

  return <Fragment />;
}
