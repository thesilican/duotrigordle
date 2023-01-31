import { Header } from "../Header/Header";
import { Welcome } from "../Welcome/Welcome";
import { app, main } from "./App.module.css";

export function App() {
  return (
    <div className={app}>
      <div className={main}>
        <Header />
        <Welcome />
      </div>
    </div>
  );
}
