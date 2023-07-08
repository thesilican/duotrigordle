import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import {
  Challenge,
  DailyChallenge,
  GameSave,
  settingsAction,
  statsAction,
  StatsEntry,
  storageAction,
  SyncedStatsEntry,
  uiAction,
} from "./store";
import { chunk } from "./util";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ApiReq<R extends Record<string, any>, S> = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
};
export type Response<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      statusCode?: number;
      message: string;
    };

export const GET_EMAILS_VALIDATE: ApiReq<{ email: string }, boolean> = {
  method: "GET",
  path: "/emails/validate",
};

export type ApiUser = {
  user_id: string;
  account_key: string;
  username: string;
  email: string | null;
  created_at: number;
};

export const GET_USER: ApiReq<
  { user_id: string } | { account_key: string },
  { user: ApiUser }
> = {
  method: "GET",
  path: "/user",
};
export const POST_USER: ApiReq<
  { username: string; email: string },
  { user: ApiUser }
> = {
  method: "POST",
  path: "/user",
};
export const PATCH_USER: ApiReq<
  { user_id: string; username: string; email: string },
  { user: ApiUser }
> = {
  method: "PATCH",
  path: "/user",
};
export const DELETE_USER: ApiReq<{ user_id: string }, null> = {
  method: "DELETE",
  path: "/user",
};

export type ApiStatsEntry = {
  game_mode: string;
  game_id: number;
  guesses: number | null;
  time: number | null;
};
export function apiGameModeToParts(gameMode: string): {
  gameMode: "daily" | "practice";
  challenge: Challenge;
} {
  const matches = gameMode.match(
    /(daily|practice)-(normal|sequence|jumble|perfect)/
  );
  if (!matches) {
    throw new Error(
      "could not convert gamemode to parts: " + JSON.stringify(gameMode)
    );
  }
  return {
    gameMode: matches[1] as "daily" | "practice",
    challenge: matches[2] as Challenge,
  };
}
export function statsEntryToApi(stats: StatsEntry): ApiStatsEntry {
  return {
    game_mode: `${stats.gameMode}-${stats.challenge}`,
    game_id: stats.id,
    guesses: stats.guesses,
    time: stats.time,
  };
}
export function apiStatsToStatsEntry(apiStats: ApiStatsEntry): StatsEntry {
  const { gameMode, challenge } = apiGameModeToParts(apiStats.game_mode);
  return {
    gameMode,
    challenge,
    id: apiStats.game_id,
    guesses: apiStats.guesses,
    time: apiStats.time,
  };
}
export const GET_STATS: ApiReq<
  { user_id: string },
  { stats: ApiStatsEntry[] }
> = {
  path: "/stats",
  method: "GET",
};
export const POST_STATS: ApiReq<
  { user_id: string; stats: ApiStatsEntry[] },
  null
> = {
  path: "/stats",
  method: "POST",
};
export const DELETE_STATS: ApiReq<{ user_id: string }, null> = {
  path: "/stats",
  method: "DELETE",
};

export type ApiGameSave = {
  game_mode: string;
  game_id: number;
  guesses: string[];
  start_time: string;
  end_time: string | null;
  pause_time: string | null;
};

export const GET_GAME_SAVES: ApiReq<
  { user_id: string; game_id: number },
  { game_saves: ApiGameSave[] }
> = { path: "/game-saves", method: "GET" };

export const POST_GAME_SAVES: ApiReq<
  { user_id: string; game_save: ApiGameSave },
  null
> = { path: "/game-saves", method: "POST" };

export async function apiFetch<R extends Record<string, any>, S>(
  request: ApiReq<R, S>,
  args: R
): Promise<Response<S>> {
  const url = new URL(`/api${request.path}`, window.location.href);
  const init: RequestInit = {
    method: request.method,
  };
  if (request.method === "GET") {
    for (const [key, val] of Object.entries(args)) {
      url.searchParams.append(key, val);
    }
  } else {
    init.body = JSON.stringify(args);
    init.headers = {
      "Content-Type": "application/json",
    };
  }

  try {
    let res = await window.fetch(url, init);
    if (res.status === 200) {
      let data;
      try {
        data = await res.json();
      } catch {}
      return {
        success: true,
        data,
      };
    } else {
      return {
        success: false,
        statusCode: res.status,
        message: await res.text(),
      };
    }
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: `could not connect to the server`,
    };
  }
}

function snackbarError(
  header: string,
  res: { message: string; statusCode?: number }
) {
  return uiAction.setSnackbar({
    status: "error",
    text:
      header +
      ": " +
      (res.statusCode ? `${res.statusCode} ` : "") +
      res.message,
  });
}

export async function apiValidateEmail(
  dispatch: Dispatch<AnyAction>,
  email: string
): Promise<boolean | null> {
  const res = await apiFetch(GET_EMAILS_VALIDATE, { email });
  if (res.success) {
    if (res.data) {
      dispatch(settingsAction.update({ kofiEmail: email }));
      return true;
    } else {
      return false;
    }
  } else {
    dispatch(snackbarError("Error validating email", res));
    return null;
  }
}

export async function apiLogin(
  dispatch: Dispatch<AnyAction>,
  options: { userId: string } | { accountKey: string },
  showSuccessMessage = true
): Promise<{ userId: string } | null> {
  const args =
    "userId" in options
      ? { user_id: options.userId }
      : { account_key: options.accountKey };
  const res = await apiFetch(GET_USER, args);
  if (res.success) {
    dispatch(
      storageAction.login({
        userId: res.data.user.user_id,
        accountKey: res.data.user.account_key,
        username: res.data.user.username,
        email: res.data.user.email,
      })
    );
    if (showSuccessMessage) {
      dispatch(
        uiAction.setSnackbar({
          status: "success",
          text: "Successfully logged in as " + res.data.user.username,
        })
      );
    }
    return { userId: res.data.user.user_id };
  } else {
    dispatch(snackbarError("Error logging in", res));
    if (res.statusCode === 404) {
      dispatch(storageAction.logout());
    }
    return null;
  }
}

export async function apiSignUp(
  dispatch: Dispatch<AnyAction>,
  username: string,
  email: string | null
): Promise<{ userId: string } | null> {
  const res = await apiFetch(POST_USER, { email: email || null, username });
  if (res.success) {
    dispatch(
      storageAction.login({
        userId: res.data.user.user_id,
        accountKey: res.data.user.account_key,
        username: res.data.user.username,
        email: res.data.user.email,
      })
    );
    dispatch(
      uiAction.setSnackbar({
        status: "success",
        text: "Successfully logged in as " + res.data.user.username,
      })
    );
    return { userId: res.data.user.user_id };
  } else {
    dispatch(snackbarError("Error signing up", res));
    return null;
  }
}

export async function apiPatchUser(
  dispatch: Dispatch<AnyAction>,
  userId: string,
  username: string,
  email: string | null
): Promise<{ username: string; email: string | null } | null> {
  const res = await apiFetch(PATCH_USER, { user_id: userId, username, email });
  if (res.success) {
    dispatch(
      storageAction.updateAccount({
        userId: res.data.user.user_id,
        email: res.data.user.email,
        username: res.data.user.username,
      })
    );
    dispatch(
      uiAction.setSnackbar({
        status: "success",
        text: "Successfully updated account details",
      })
    );
    return {
      username: res.data.user.username,
      email: res.data.user.email,
    };
  } else {
    dispatch(snackbarError("Error updating account details", res));
    return null;
  }
}

export async function apiDeleteUser(
  dispatch: Dispatch<AnyAction>,
  userId: string
) {
  const res = await apiFetch(DELETE_USER, { user_id: userId });
  if (res.success) {
    dispatch(storageAction.logout());
    dispatch(
      uiAction.setSnackbar({
        status: "success",
        text: "Successfully deleted account",
      })
    );
  } else {
    dispatch(snackbarError("Error deleting user", res));
  }
}

export async function apiGetStats(
  dispatch: Dispatch<AnyAction>,
  userId: String
): Promise<StatsEntry[] | null> {
  const res = await apiFetch(GET_STATS, { user_id: userId });
  if (res.success) {
    const stats = res.data.stats.map(apiStatsToStatsEntry);
    return stats;
  } else {
    dispatch(snackbarError("Error fetching stats", res));
    return null;
  }
}

export async function apiPostStats(
  dispatch: Dispatch<AnyAction>,
  userId: string,
  stats: SyncedStatsEntry[]
) {
  const unsyncedStats = stats.filter((x) => !x.synced);
  const chunks = chunk(unsyncedStats, 100);
  for (const chunk of chunks) {
    const res = await apiFetch(POST_STATS, {
      user_id: userId,
      stats: chunk.map(statsEntryToApi),
    });
    if (res.success) {
      dispatch(
        statsAction.setSynced(
          chunk.map((entry) => ({
            key: entry,
            synced: true,
          }))
        )
      );
    } else {
      dispatch(snackbarError("Error uploading stats", res));
      break;
    }
  }
}

export async function apiGetGameSaves(
  dispatch: Dispatch<AnyAction>,
  userId: string,
  gameId: number
) {
  const res = await apiFetch(GET_GAME_SAVES, {
    user_id: userId,
    game_id: gameId,
  });
  if (res.success) {
    for (const save of res.data.game_saves) {
      const { gameMode, challenge } = apiGameModeToParts(save.game_mode);
      if (
        gameMode !== "daily" ||
        challenge === "perfect" ||
        save.game_id !== gameId
      )
        continue;
      dispatch(
        storageAction.setDaily({
          challenge: challenge,
          gameSave: {
            id: save.game_id,
            guesses: save.guesses,
            startTime: new Date(save.start_time).getTime(),
            endTime:
              save.end_time === null ? null : new Date(save.end_time).getTime(),
            pauseTime:
              save.pause_time === null
                ? null
                : new Date(save.pause_time).getTime(),
          },
        })
      );
    }
  } else {
    dispatch(snackbarError("Error fetching game saves", res));
  }
}
export async function apiPostGameSave(
  dispatch: Dispatch<AnyAction>,
  userId: string,
  challenge: DailyChallenge,
  gameSave: GameSave
) {
  if (!gameSave.startTime) return;
  const res = await apiFetch(POST_GAME_SAVES, {
    user_id: userId,
    game_save: {
      game_mode: `daily-${challenge}`,
      game_id: gameSave.id,
      guesses: gameSave.guesses,
      start_time: new Date(gameSave.startTime).toISOString(),
      end_time:
        gameSave.endTime === null
          ? null
          : new Date(gameSave.endTime).toISOString(),
      pause_time:
        gameSave.pauseTime === null
          ? null
          : new Date(gameSave.pauseTime).toISOString(),
    },
  });
  if (res.success) {
  } else {
    dispatch(snackbarError("Error uploading game save", res));
  }
}
