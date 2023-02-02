import { useAppSelector } from "../../store";
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
import { main } from "./App.module.css";

export function App() {
  const view = useAppSelector((s) => s.ui.view);
  return (
    <>
      <div className={main}>
        <Header />
        {view === "welcome" ? <Welcome /> : <Boards />}
        <Keyboard />
        <Results />
      </div>
      <About />
      <Stats />
      <Settings />
      <LocalStorage />
      <KeyboardListener />
    </>
  );
}
