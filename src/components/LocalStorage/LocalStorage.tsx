import { Fragment, useEffect, useLayoutEffect, useState } from "react";
import {
  storageAction,
  settingsAction,
  statsAction,
  useAppDispatch,
  useAppSelector,
  LAST_UPDATED,
  uiAction,
} from "../../store";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  SETTINGS_PARSER,
  STATS_PARSER,
  STORAGE_PARSER,
} from "./storage";

export function LocalStorage() {
  const dispatch = useAppDispatch();
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    if (!loaded) {
      const storage = loadFromLocalStorage(STORAGE_PARSER);
      if (storage) {
        dispatch(storageAction.load(storage));
      }
      const settings = loadFromLocalStorage(SETTINGS_PARSER);
      if (settings) {
        dispatch(settingsAction.update(settings));
      }
      const stats = loadFromLocalStorage(STATS_PARSER);
      if (stats) {
        dispatch(statsAction.load(stats));
      }

      // Check last updated, show changelog if different
      if (storage?.lastUpdated !== LAST_UPDATED) {
        dispatch(storageAction.setLastUpdated(LAST_UPDATED));
        if (storage?.lastUpdated !== undefined) {
          dispatch(uiAction.showModal("changelog"));
        }
      }

      setLoaded(true);
    }
  }, [dispatch, loaded]);

  const storage = useAppSelector((s) => s.storage);
  useEffect(() => {
    if (loaded) {
      saveToLocalStorage(STORAGE_PARSER.key, storage);
    }
  }, [storage, loaded]);
  const settings = useAppSelector((s) => s.settings);
  useEffect(() => {
    if (loaded) {
      saveToLocalStorage(SETTINGS_PARSER.key, settings);
    }
  }, [settings, loaded]);
  const stats = useAppSelector((s) => s.stats);
  useEffect(() => {
    if (loaded) {
      saveToLocalStorage(STATS_PARSER.key, stats);
    }
  }, [stats, loaded]);

  return <Fragment />;
}
