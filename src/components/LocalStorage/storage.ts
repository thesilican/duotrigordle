import {
  Challenge,
  DailySaves,
  GameSave,
  HistoryEntry,
  StorageState,
  SettingsState,
  StatsState,
  settingsInitialState,
  PRACTICE_MODE_MAX_ID,
  PRACTICE_MODE_MIN_ID,
} from "../../store";

interface Parser<T> {
  key: string;
  parse(obj: unknown): T | null;
}

export class StorageParser implements Parser<StorageState> {
  key = "duotrigordle-state";
  parse(obj: unknown): StorageState | null {
    if (typeof obj === "object" && obj !== null) {
      const daily = this.parseDailySaves((obj as any).daily);
      const lastUpdated = this.parseLastUpdated((obj as any).lastUpdated);
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
  parseDailySaves(obj: unknown): DailySaves | null {
    if (
      typeof obj === "object" &&
      obj !== null &&
      "normal" in obj &&
      "sequence" in obj &&
      "jumble" in obj
    ) {
      const normal = this.parseGameSave(obj.normal);
      const sequence = this.parseGameSave(obj.sequence);
      const jumble = this.parseGameSave(obj.jumble);
      return { normal, sequence, jumble };
    } else {
      return null;
    }
  }
  parseGameSave(obj: unknown): GameSave | null {
    if (
      typeof obj === "object" &&
      obj !== null &&
      "id" in obj &&
      typeof obj.id == "number" &&
      "guesses" in obj &&
      Array.isArray(obj.guesses) &&
      "startTime" in obj &&
      (typeof obj.startTime == "number" || obj.startTime === null) &&
      "endTime" in obj &&
      (typeof obj.endTime == "number" || obj.endTime === null) &&
      "pauseTime" in obj &&
      (typeof obj.pauseTime == "number" || obj.pauseTime === null)
    ) {
      return {
        id: obj.id,
        guesses: obj.guesses,
        startTime: obj.startTime,
        endTime: obj.endTime,
        pauseTime: obj.pauseTime,
      };
    } else {
      return null;
    }
  }
  parseLastUpdated(obj: unknown): string | null {
    if (typeof obj === "string") {
      return obj;
    } else {
      return null;
    }
  }
}

// Serialization for stats
class StatsParser implements Parser<StatsState> {
  key = "duotrigordle-stats";
  parse(obj: unknown): StatsState | null {
    if (typeof obj !== "object" || obj === null) {
      return null;
    }
    const history: HistoryEntry[] = [];
    if ("history" in obj && Array.isArray(obj.history)) {
      for (const el of obj.history) {
        const entry = this.parseEntry(el);
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
  parseEntry(obj: unknown): HistoryEntry | null {
    if (typeof obj !== "object" || obj === null) {
      return null;
    }
    let gameMode: "daily" | "practice",
      challenge: Challenge,
      id: number,
      guesses: number | null,
      time: number | null;

    if (!("gameMode" in obj)) {
      gameMode = "daily";
    } else if (
      "gameMode" in obj &&
      (obj.gameMode === "daily" || obj.gameMode === "practice")
    ) {
      gameMode = obj.gameMode;
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

    if (!("id" in obj)) {
      if (gameMode === "practice") {
        id =
          Math.floor(
            Math.random() * (PRACTICE_MODE_MAX_ID - PRACTICE_MODE_MIN_ID)
          ) + PRACTICE_MODE_MIN_ID;
      } else {
        return null;
      }
    } else if (typeof obj.id === "number" && Number.isInteger(obj.id)) {
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
    } else if ("time" in obj && typeof obj.time === "number") {
      time = Math.round(obj.time);
    } else {
      return null;
    }

    return { gameMode, challenge, id, guesses, time };
  }
}

// Serialization for settings
class SettingsParser implements Parser<SettingsState> {
  key = "duotrigordle-settings";
  parse(obj: unknown): SettingsState | null {
    if (typeof obj === "object" && obj !== null) {
      return {
        ...settingsInitialState,
        ...obj,
      };
    } else {
      return null;
    }
  }
}

export function loadFromLocalStorage<T>(parser: Parser<T>): T | null {
  try {
    const text = localStorage.getItem(parser.key);
    if (text === null) return null;
    const obj = JSON.parse(text);
    const parsed = parser.parse(obj);
    return parsed;
  } catch {
    return null;
  }
}

export function saveToLocalStorage<T>(key: string, obj: T) {
  const text = JSON.stringify(obj);
  localStorage.setItem(key, text);
}

export const STORAGE_PARSER = new StorageParser();
export const STATS_PARSER = new StatsParser();
export const SETTINGS_PARSER = new SettingsParser();
