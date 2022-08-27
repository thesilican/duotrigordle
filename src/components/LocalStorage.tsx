import { Dispatch } from "@reduxjs/toolkit";
import { Fragment, useEffect, useLayoutEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { NUM_GUESSES } from "../consts";
import { getAllWordsGuessed, getTargetWords, getTodaysId } from "../funcs";
import {
  GameState,
  loadGame,
  loadStats,
  SettingsState,
  startGame,
  StatsState,
  updateSettings,
  useSelector,
} from "../store";

// This component doesn't actually render anything, but it manages
// saving & loading state from local storage
export default function LocalStorage() {
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

  const game = useSelector((s) => s.game);
  useEffect(() => {
    if (loaded && !game.practice) {
      saveGameToLocalStorage(game);
    }
  }, [game, loaded]);
  const settings = useSelector((s) => s.settings);
  useEffect(() => {
    if (loaded) {
      saveSettingsToLocalStorage(settings);
    }
  }, [settings, loaded]);
  const stats = useSelector((s) => s.stats);
  useEffect(() => {
    if (loaded) {
      saveStatsToLocalStorage(stats);
    }
  }, [stats, loaded]);

  return <Fragment />;
}

// Serialization for game
type GameSerialized = {
  id: number;
  guesses: string[];
  startTime: number;
  endTime: number;
};
function isGameSerialized(obj: any): obj is GameSerialized {
  // Check the shape of the object just in case a previous invalid version of
  // the object was stored in local storage
  try {
    if (typeof obj !== "object" || obj === null) {
      return false;
    }
    if (typeof obj.id !== "number") {
      return false;
    }
    if (!Array.isArray(obj.guesses)) {
      return false;
    }
    if (obj.guesses.length > NUM_GUESSES) {
      return false;
    }
    for (const guess of obj.guesses) {
      if (typeof guess !== "string") {
        return false;
      }
    }
    if (typeof obj.startTime !== "number") {
      return false;
    }
    if (typeof obj.endTime !== "number") {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
function serializeGame(state: GameState): GameSerialized {
  return {
    id: state.id,
    guesses: state.guesses,
    startTime: state.startTime,
    endTime: state.endTime,
  };
}
function deserializeGame(serialized: GameSerialized): GameState {
  const targets = getTargetWords(serialized.id);
  const gameOver =
    serialized.guesses.length === NUM_GUESSES ||
    getAllWordsGuessed(targets, serialized.guesses);
  return {
    id: serialized.id,
    input: "",
    targets,
    guesses: serialized.guesses,
    gameOver,
    practice: false,
    startTime: serialized.startTime,
    endTime: serialized.endTime,
  };
}
export function loadGameFromLocalStorage(dispatch: Dispatch) {
  const todaysId = getTodaysId();
  const text = localStorage.getItem("duotrigordle-state");
  const serialized = text && JSON.parse(text);
  if (isGameSerialized(serialized) && serialized.id === todaysId) {
    dispatch(loadGame({ game: deserializeGame(serialized) }));
  } else {
    dispatch(startGame({ id: todaysId, practice: false }));
  }
}
function saveGameToLocalStorage(state: GameState) {
  localStorage.setItem(
    "duotrigordle-state",
    JSON.stringify(serializeGame(state))
  );
}

// Serialization for settings
function loadSettingsFromLocalStorage(dispatch: Dispatch) {
  const text = localStorage.getItem("duotrigordle-settings");
  const settings = text && JSON.parse(text);
  if (settings) {
    dispatch(updateSettings(settings));
  }
}
function saveSettingsToLocalStorage(state: SettingsState) {
  localStorage.setItem("duotrigordle-settings", JSON.stringify(state));
}

// Serialization for stats
function loadStatsFromLocalStorage(dispatch: Dispatch) {
  const text = localStorage.getItem("duotrigordle-stats");
  const stats = text && JSON.parse(text);
  if (stats) {
    dispatch(loadStats(stats));
  }
}
function saveStatsToLocalStorage(state: StatsState) {
  localStorage.setItem("duotrigordle-stats", JSON.stringify(state));
}
