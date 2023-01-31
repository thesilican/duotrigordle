import { Boards } from "../Boards/Boards";
import { Header } from "../Header/Header";
import { Keyboard } from "../Keyboard/Keyboard";
import { Welcome } from "../Welcome/Welcome";
import { app, main } from "./App.module.css";

export function App() {
  return (
    <div className={app}>
      <div className={main}>
        <Header />
        {true ? <Welcome /> : <Boards />}
        <Keyboard />
      </div>
    </div>
  );
}
