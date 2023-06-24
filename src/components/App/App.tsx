import cn from "classnames";
import { useEffect } from "react";
import { useAppSelector } from "../../store";
import { addDebugHooks } from "../../store/debug";
import { assertNever } from "../../util";
import { Boards } from "../Boards/Boards";
import { Changelog } from "../Changelog/Changelog";
import { Header } from "../Header/Header";
import { HowToPlay } from "../HowToPlay/HowToPlay";
import { Keyboard } from "../Keyboard/Keyboard";
import { KeyboardListener } from "../KeyboardListener/KeyboardListener";
import { LocalStorage } from "../LocalStorage/LocalStorage";
import { NavigationListener } from "../NagivationListener/NagivationListener";
import { PrivacyPolicy } from "../PrivacyPolicy/PrivacyPolicy";
import { Results } from "../Results/Results";
import { Settings } from "../Settings/Settings";
import Stats from "../Stats/Stats";
import { Welcome } from "../Welcome/Welcome";
import styles from "./App.module.css";

export function App() {
  const view = useAppSelector((s) => s.ui.view);
  const gameOver = useAppSelector((s) => s.game.gameOver);
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
        <>
          <Boards />
          {!gameOver ? <Keyboard /> : <Results />}
        </>
      ) : view === "privacy-policy" ? (
        <PrivacyPolicy />
      ) : view === "how-to-play" ? (
        <HowToPlay />
      ) : view === "stats" ? (
        <Stats />
      ) : (
        assertNever(view)
      )}
      <Changelog />
      <Settings />
      <LocalStorage />
      <KeyboardListener />
      <NavigationListener />
    </div>
  );
}
