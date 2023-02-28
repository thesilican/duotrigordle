import {
  Challenge,
  GameSave,
  HistoryEntry,
  SavesState,
  SettingsState,
  StatsState,
} from "../../store";

export function loadFromLocalStorage<T>(
  key: string,
  parser: (obj: unknown) => T | null
): T | null {
  try {
    const text = localStorage.getItem(key);
    if (text === null) return null;
    const obj = JSON.parse(text);
    const parsed = parser(obj);
    return parsed;
  } catch {
    return null;
  }
}

export function saveToLocalStorage<T>(key: string, obj: T) {
  const text = JSON.stringify(obj);
  localStorage.setItem(key, text);
}

// Serialization for saves
export const STORAGE_KEY_SAVES = "duotrigordle-state";
export function parseSaves(obj: unknown): SavesState | null {
  if (
    typeof obj === "object" &&
    obj !== null &&
    "daily" in obj &&
    typeof obj.daily === "object" &&
    obj.daily !== null &&
    "normal" in obj.daily &&
    "sequence" in obj.daily &&
    "jumble" in obj.daily
  ) {
    const normal = parseGameSave(obj.daily.normal);
    const sequence = parseGameSave(obj.daily.sequence);
    const jumble = parseGameSave(obj.daily.jumble);
    return {
      daily: {
        normal,
        sequence,
        jumble,
      },
    };
  } else {
    return null;
  }
}
export function parseGameSave(obj: unknown): GameSave | null {
  // Check the shape of the object just in case a previous invalid version of
  // the object was stored in local storage
  if (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    typeof obj.id == "number" &&
    "guesses" in obj &&
    Array.isArray(obj.guesses) &&
    "startTime" in obj &&
    typeof obj.startTime == "number" &&
    "endTime" in obj &&
    typeof obj.endTime == "number"
  ) {
    return {
      id: obj.id,
      guesses: obj.guesses,
      startTime: obj.startTime,
      endTime: obj.endTime,
    };
  } else {
    return null;
  }
}

// Serialization for stats
export const STORAGE_KEY_STATS = "duotrigordle-stats";
export function parseStats(obj: unknown): StatsState | null {
  if (typeof obj !== "object" || obj === null) {
    return null;
  }
  const history: HistoryEntry[] = [];
  if ("history" in obj && Array.isArray(obj.history)) {
    for (const el of obj.history) {
      const entry = parseEntry(el);
      if (entry) {
        history.push(entry);
      }
    }
  } else {
    return null;
  }
  return {
    history,
  };
}
function parseEntry(obj: unknown): HistoryEntry | null {
  if (typeof obj !== "object" || obj === null) {
    return null;
  }
  let id: number,
    guesses: number | null,
    time: number | null,
    challenge: Challenge;
  if ("id" in obj && typeof obj.id === "number" && Number.isInteger(obj.id)) {
    id = obj.id;
  } else {
    return null;
  }
  if (!("guesses" in obj) || obj.guesses === null) {
    guesses = null;
  } else if (
    "guesses" in obj &&
    typeof obj.guesses === "number" &&
    Number.isInteger(obj.guesses)
  ) {
    guesses = obj.guesses;
  } else {
    return null;
  }
  if (!("time" in obj) || obj.time === null) {
    time = null;
  } else if (
    "time" in obj &&
    typeof obj.time === "number" &&
    Number.isInteger(obj.time)
  ) {
    time = obj.time;
  } else {
    return null;
  }
  if (!("challenge" in obj)) {
    challenge = "normal";
  } else if (
    "challenge" in obj &&
    (obj.challenge === "normal" ||
      obj.challenge === "sequence" ||
      obj.challenge === "jumble" ||
      obj.challenge === "perfect")
  ) {
    challenge = obj.challenge;
  } else {
    return null;
  }

  return {
    id,
    guesses,
    time,
    challenge,
  };
}

// Serialization for settings
export const STORAGE_KEY_SETTINGS = "duotrigordle-settings";
export function parseSettings(obj: unknown): SettingsState | null {
  // Too lazy to typecheck :)
  return obj as SettingsState;
}
