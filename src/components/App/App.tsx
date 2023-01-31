import { useAppSelector } from "../../store";
import { Boards } from "../Boards/Boards";
import { Header } from "../Header/Header";
import { Keyboard } from "../Keyboard/Keyboard";
import { LocalStorage } from "../LocalStorage/LocalStorage";
import { Welcome } from "../Welcome/Welcome";
import { app, main } from "./App.module.css";

export function App() {
  const view = useAppSelector((s) => s.ui.view);
  return (
    <>
      <div className={app}>
        <div className={main}>
          <Header />
          {view === "welcome" ? <Welcome /> : <Boards />}
          <Keyboard />
        </div>
      </div>
      <LocalStorage />
    </>
  );
}
