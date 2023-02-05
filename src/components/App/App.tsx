import { useEffect } from "react";
import { useAppSelector } from "../../store";
import { addDebugHooks } from "../../store/debug";
import { About } from "../About/About";
import { Boards } from "../Boards/Boards";
import { Header } from "../Header/Header";
import { Keyboard } from "../Keyboard/Keyboard";
import { KeyboardListener } from "../KeyboardListener/KeyboardListener";
import { LocalStorage } from "../LocalStorage/LocalStorage";
import { Results } from "../Results/Results";
import { Settings } from "../Settings/Settings";
import Stats from "../Stats/Stats";
import { Welcome } from "../Welcome/Welcome";
import styles from "./App.module.css";

export function App() {
  const view = useAppSelector((s) => s.ui.view);
  const gameOver = useAppSelector((s) => s.game.gameOver);
  const showKeyboard = view === "game" && !gameOver;
  const showResults = view === "game" && gameOver;

  useEffect(() => {
    addDebugHooks();
  }, []);

  return (
    <>
      <div className={styles.main}>
        <Header />
        {view === "welcome" ? <Welcome /> : <Boards />}
        {showKeyboard ? <Keyboard /> : null}
        {showResults ? <Results /> : null}
      </div>
      <About />
      <Stats />
      <Settings />
      <LocalStorage />
      <KeyboardListener />
    </>
  );
}
