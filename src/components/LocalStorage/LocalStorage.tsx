import { Fragment, useEffect, useLayoutEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../store";
import {
  loadGameFromLocalStorage,
  loadSettingsFromLocalStorage,
  loadStatsFromLocalStorage,
  saveGameToLocalStorage,
  saveSettingsToLocalStorage,
  saveStatsToLocalStorage,
} from "../../store/storage";

export function LocalStorage() {
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    if (!loaded) {
      loadGameFromLocalStorage(dispatch);
      loadSettingsFromLocalStorage(dispatch);
      loadStatsFromLocalStorage(dispatch);
      setLoaded(true);
    }
  }, [dispatch, loaded]);

  const game = useAppSelector((s) => s.game);
  useEffect(() => {
    if (loaded && game.gameMode === "daily") {
      saveGameToLocalStorage(game);
    }
  }, [game, loaded]);
  const settings = useAppSelector((s) => s.settings);
  useEffect(() => {
    if (loaded) {
      saveSettingsToLocalStorage(settings);
    }
  }, [settings, loaded]);
  const stats = useAppSelector((s) => s.stats);
  useEffect(() => {
    if (loaded) {
      saveStatsToLocalStorage(stats);
    }
  }, [stats, loaded]);

  return <Fragment />;
}
