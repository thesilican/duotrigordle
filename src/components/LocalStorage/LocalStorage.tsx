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
} from "./storage";

export function LocalStorage() {
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    if (!loaded) {
      setLoaded(true);
      loadGameFromLocalStorage(dispatch);
      loadSettingsFromLocalStorage(dispatch);
      loadStatsFromLocalStorage(dispatch);
    }
  }, [dispatch, loaded]);

  const game = useAppSelector((s) => s.game);
  useEffect(() => {
    if (loaded && !game.practice) {
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
