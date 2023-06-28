import { Fragment, useEffect, useLayoutEffect } from "react";
import {
  gameAction,
  Path,
  selectNextSideEffect,
  uiAction,
  UiView,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { assertNever } from "../../util";

// This function is responsible for dealing with the app's URL and navigation
export function NavigationListener() {
  const dispatch = useAppDispatch();
  const sideEffect = useAppSelector(selectNextSideEffect);
  const view = useAppSelector((s) => s.ui.view);

  useLayoutEffect(() => {
    // When the user lands on the site initially, we check if
    // they landed on a page other than the homepage,
    // if they do, we have to mark the page as "dangling"
    // since going back in the history will not take you
    // to the homepage
    let view: UiView = "welcome";
    let dangling = undefined;
    const DANGLING_VIEWS: Exclude<UiView, "game">[] = [
      "privacy-policy",
      "how-to-play",
      "stats",
      "account",
    ];
    for (const danglingView of DANGLING_VIEWS) {
      const { url } = serializePath({ view: danglingView });
      if (window.location.pathname === url) {
        view = danglingView;
        dangling = true;
        break;
      }
    }
    const { url, title } = serializePath({ view });
    window.history.replaceState({ view, dangling }, "", url);
    document.title = title;
    if (view !== "welcome") {
      dispatch(uiAction.setView(view));
    }
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
          window.history.pushState(path, "", url);
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
          to: e.state,
          timestamp: Date.now(),
          browser: true,
        })
      );
      document.title = serializePath(e.state).title;
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [dispatch]);

  useEffect(() => {
    // Install hooks on window visibility change or unload
    // to pause or unpause the game
    // Only install hooks when in game view
    if (view !== "game") {
      return;
    }
    // Pause the game when closing window
    const handleUnload = () => {
      dispatch(gameAction.pause({ timestamp: Date.now() }));
    };
    // Pause/unpause game when visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        dispatch(gameAction.pause({ timestamp: Date.now() }));
      } else {
        dispatch(gameAction.unpause({ timestamp: Date.now() }));
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch, view]);

  return <Fragment />;
}

function serializePath(path: Path): { url: string; title: string } {
  if (path.view === "game") {
    if (path.gameMode === "daily") {
      if (path.challenge === "normal") {
        return { url: "/daily", title: "Daily Duotrigordle" };
      } else if (path.challenge === "sequence") {
        return { url: "/daily-sequence", title: "Daily Sequence" };
      } else if (path.challenge === "jumble") {
        return { url: "/daily-jumble", title: "Daily Jumble" };
      } else {
        return assertNever(path.challenge);
      }
    } else if (path.gameMode === "practice") {
      if (path.challenge === "normal") {
        return { url: "/practice", title: "Practice Duotrigordle" };
      } else if (path.challenge === "sequence") {
        return { url: "/practice-sequence", title: "Practice Sequence" };
      } else if (path.challenge === "jumble") {
        return { url: "/practice-jumble", title: "Practice Jumble" };
      } else if (path.challenge === "perfect") {
        return { url: "/perfect", title: "Perfect Challenge" };
      } else {
        return assertNever(path.challenge);
      }
    } else if (path.gameMode === "historic") {
      if (path.challenge === "normal") {
        return { url: `/historic/${path.id}`, title: "Historic Duotrigordle" };
      } else if (path.challenge === "sequence") {
        return {
          url: `/historic-sequence/${path.id}`,
          title: "Historic Sequence",
        };
      } else if (path.challenge === "jumble") {
        return { url: `/historic-jumble/${path.id}`, title: "Historic Jumble" };
      } else {
        return assertNever(path.challenge);
      }
    } else {
      return assertNever(path);
    }
  } else if (path.view === "welcome") {
    return { url: "/", title: "Duotrigordle" };
  } else if (path.view === "how-to-play") {
    return { url: "/how-to-play", title: "How to play" };
  } else if (path.view === "privacy-policy") {
    return { url: "/privacy", title: "Privacy Policy" };
  } else if (path.view === "stats") {
    return { url: "/stats", title: "Stats" };
  } else if (path.view === "account") {
    return { url: "/account", title: "Account" };
  } else {
    assertNever(path.view);
  }
}
