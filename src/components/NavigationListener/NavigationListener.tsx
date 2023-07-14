import { Fragment, useEffect, useLayoutEffect } from "react";
import {
  selectNextSideEffect,
  uiAction,
  UiPath,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { assertNever } from "../../util";

// This function is responsible for dealing with the app's URL and navigation
export function NavigationListener() {
  const dispatch = useAppDispatch();
  const sideEffect = useAppSelector(selectNextSideEffect);

  useLayoutEffect(() => {
    // When the user lands on the site initially, we check if
    // they landed on a page other than the homepage,
    // if they do, we have to mark the page as "dangling"
    // since going back in the history will not take you
    // to the homepage
    let path = parsePath(window.location.pathname);
    let dangling = undefined;
    if (path.view === "game") {
      path = { view: "welcome" };
    } else if (path.view !== "welcome") {
      dangling = true;
    }
    const { url, title } = serializePath(path);
    window.history.replaceState({ path, dangling }, "", url);
    document.title = title;
    dispatch(
      uiAction.navigate({
        to: path,
        timestamp: Date.now(),
        browser: true,
      })
    );
  }, [dispatch]);

  useLayoutEffect(() => {
    // After performing a navigation event, the ui reducer
    // will trigger an "update-history" side effect to
    // update the window history to match the ui state
    if (sideEffect?.type === "update-history") {
      if (
        sideEffect.action.type === "push" ||
        sideEffect.action.type === "replace"
      ) {
        const path = sideEffect.action.path;
        const { url, title } = serializePath(path);
        if (sideEffect.action.type === "replace") {
          // Preserve dangling when replacing state
          const state = { ...window.history.state, path };
          window.history.replaceState(state, "", url);
        } else {
          window.history.pushState({ path }, "", url);
        }
        document.title = title;
      } else if (sideEffect.action.type === "pop") {
        if (window.history.state.dangling) {
          window.location.href = "/";
        } else {
          window.history.back();
        }
      }
      dispatch(uiAction.resolveSideEffect(sideEffect.id));
    }
  }, [sideEffect, dispatch]);

  useEffect(() => {
    // Listen to browser navigation events, and
    // cause a navigation event in response
    const handler = (e: PopStateEvent) => {
      dispatch(
        uiAction.navigate({
          to: e.state.path,
          timestamp: Date.now(),
          browser: true,
        })
      );
      document.title = serializePath(e.state).title;
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [dispatch]);

  return <Fragment />;
}

function serializePath(path: UiPath): { url: string; title: string } {
  if (path.view === "game") {
    let url = `/${path.gameMode}/${path.challenge}`;
    if (path.gameMode === "historic") {
      url += `/${path.id}`;
    }
    let title;
    if (path.gameMode === "daily") {
      if (path.challenge === "normal") {
        title = "Daily Duotrigordle";
      } else if (path.challenge === "sequence") {
        title = "Daily Sequence";
      } else if (path.challenge === "jumble") {
        title = "Daily Jumble";
      } else {
        return assertNever(path.challenge);
      }
    } else if (path.gameMode === "practice") {
      if (path.challenge === "normal") {
        title = "Practice Duotrigordle";
      } else if (path.challenge === "sequence") {
        title = "Practice Sequence";
      } else if (path.challenge === "jumble") {
        title = "Practice Jumble";
      } else if (path.challenge === "perfect") {
        title = "Perfect Challenge";
      } else {
        return assertNever(path.challenge);
      }
    } else if (path.gameMode === "historic") {
      if (path.challenge === "normal") {
        title = "Historic Duotrigordle";
      } else if (path.challenge === "sequence") {
        title = "Historic Sequence";
      } else if (path.challenge === "jumble") {
        title = "Historic Jumble";
      } else {
        return assertNever(path.challenge);
      }
    } else {
      return assertNever(path);
    }
    return { url, title };
  } else if (path.view === "stats") {
    const url = `/stats/${path.gameMode}/${path.challenge}`;
    return { url, title: "Stats" };
  } else if (path.view === "welcome") {
    return { url: "/", title: "Duotrigordle" };
  } else if (path.view === "how-to-play") {
    return { url: "/how-to-play", title: "How to play" };
  } else if (path.view === "privacy-policy") {
    return { url: "/privacy-policy", title: "Privacy Policy" };
  } else if (path.view === "account") {
    return { url: "/account", title: "Account" };
  } else {
    assertNever(path.view);
  }
}
function parsePath(path: string): UiPath {
  let match;
  if ((match = path.match(/\/game\/([a-z]+)\/([a-z]+)(\/(\d+))?/))) {
    const gameMode = match[1];
    const challenge = match[2];
    const hasId = match[3];
    const id = match[4];
    if (gameMode === "daily") {
      if (
        !hasId &&
        (challenge === "normal" ||
          challenge === "sequence" ||
          challenge === "jumble")
      ) {
        return { view: "game", gameMode, challenge };
      }
    } else if (gameMode === "practice") {
      if (
        !hasId &&
        (challenge === "normal" ||
          challenge === "sequence" ||
          challenge === "jumble" ||
          challenge === "perfect")
      ) {
        return { view: "game", gameMode, challenge };
      }
    } else if (gameMode === "historic") {
      const num = parseInt(id, 10);
      if (
        (challenge === "normal" ||
          challenge === "sequence" ||
          challenge === "jumble") &&
        hasId &&
        Number.isInteger(num) &&
        num > 1
      ) {
        return { view: "game", gameMode, challenge, id: num };
      }
    }
  } else if ((match = path.match(/\/stats\/(\w+)\/(\w+)/))) {
    const gameMode = match[1];
    const challenge = match[2];
    if (
      (gameMode === "daily" || gameMode === "practice") &&
      (challenge === "normal" ||
        challenge === "sequence" ||
        challenge === "jumble" ||
        challenge === "perfect")
    ) {
      return { view: "stats", gameMode, challenge };
    }
  } else if ((match = path.match(/\/([-a-z]+)/))) {
    const view = match[1];
    if (
      view === "privacy-policy" ||
      view === "how-to-play" ||
      view === "account"
    ) {
      return { view };
    }
  }
  return { view: "welcome" };
}
