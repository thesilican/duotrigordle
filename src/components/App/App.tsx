import cn from "classnames";
import { useEffect } from "react";
import { useAppSelector } from "../../store";
import { addDebugHooks } from "../../store/debug";
import { assertNever } from "../../util";
import { Account } from "../Account/Account";
import { Changelog } from "../Changelog/Changelog";
import { Snackbar } from "../Snackbar/Snackbar";
import { Game } from "../Game/Game";
import { Header } from "../Header/Header";
import { HowToPlay } from "../HowToPlay/HowToPlay";
import { KeyboardListener } from "../KeyboardListener/KeyboardListener";
import { LocalStorage } from "../LocalStorage/LocalStorage";
import { NavigationListener } from "../NavigationListener/NavigationListener";
import { PrivacyPolicy } from "../PrivacyPolicy/PrivacyPolicy";
import { Settings } from "../Settings/Settings";
import Stats from "../Stats/Stats";
import { Welcome } from "../Welcome/Welcome";
import styles from "./App.module.css";
import { ServerListener } from "../ServerListener/ServerListener";

export function App() {
  const view = useAppSelector((s) => s.ui.view);
  const disableAnimations = useAppSelector((s) => s.settings.disableAnimations);

  useEffect(() => {
    addDebugHooks();
  }, []);

  // Prevent duotrigordle form working in iframes
  if (window.top !== window) {
    return (
      <p>
        Play Duotrigordle at{" "}
        <a href="https://duotrigordle.com" target="_blank" rel="noreferrer">
          https://duotrigordle.com
        </a>
      </p>
    );
  }

  return (
    <div
      className={cn(
        styles.main,
        view === "game" && styles.game,
        disableAnimations && styles.disableAnimations
      )}
    >
      <Header />
      {view === "welcome" ? (
        <Welcome />
      ) : view === "game" ? (
        <Game />
      ) : view === "privacy-policy" ? (
        <PrivacyPolicy />
      ) : view === "how-to-play" ? (
        <HowToPlay />
      ) : view === "stats" ? (
        <Stats />
      ) : view === "account" ? (
        <Account />
      ) : (
        assertNever(view)
      )}
      <Changelog />
      <Settings />
      <Snackbar />
      <LocalStorage />
      <KeyboardListener />
      <NavigationListener />
      <ServerListener />
    </div>
  );
}
