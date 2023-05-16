import {
  Challenge,
  DailySaves,
  GameSave,
  HistoryEntry,
  StorageState,
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
export const STORAGE_KEY_STORAGE = "duotrigordle-state";
export function parseStorage(obj: unknown): StorageState | null {
  if (typeof obj === "object" && obj !== null) {
    // This isn't the most eloquent but it works I think
    const daily = parseDailySaves((obj as any).daily);
    const lastUpdated = parseLastUpdated((obj as any).lastUpdated);
    return {
      daily: daily ?? {
        normal: null,
        jumble: null,
        sequence: null,
      },
      lastUpdated: lastUpdated ?? "1970-01-01",
    };
  } else {
    return null;
  }
}
export function parseDailySaves(obj: unknown): DailySaves | null {
  if (
    typeof obj === "object" &&
    obj !== null &&
    "normal" in obj &&
    "sequence" in obj &&
    "jumble" in obj
  ) {
    const normal = parseGameSave(obj.normal);
    const sequence = parseGameSave(obj.sequence);
    const jumble = parseGameSave(obj.jumble);
    return { normal, sequence, jumble };
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
export function parseLastUpdated(obj: unknown): string | null {
  if (typeof obj === "string") {
    return obj;
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
  let id: number | null,
    guesses: number | null,
    time: number | null,
    challenge: Challenge,
    gameMode: "daily" | "practice";

  if ("id" in obj && typeof obj.id === "number" && Number.isInteger(obj.id)) {
    id = obj.id;
  } else {
    id = null;
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
  if (!("gameMode" in obj)) {
    gameMode = "daily";
  } else if ("gameMode" in obj && obj.gameMode === "daily") {
    gameMode = "daily";
  } else if ("gameMode" in obj && obj.gameMode === "practice") {
    gameMode = "practice";
  } else {
    return null;
  }

  if (gameMode === "practice") {
    return {
      gameMode,
      challenge,
      guesses,
      time,
    };
  } else if (id === null) {
    return null;
  } else {
    return { gameMode, challenge, id, guesses, time };
  }
}

// Serialization for settings
export const STORAGE_KEY_SETTINGS = "duotrigordle-settings";
export function parseSettings(obj: unknown): SettingsState | null {
  // Too lazy to typecheck :)
  return obj as SettingsState;
}
