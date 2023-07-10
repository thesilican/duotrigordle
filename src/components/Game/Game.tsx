import { useAppSelector } from "../../store";
import { Boards } from "../Boards/Boards";
import { Keyboard } from "../Keyboard/Keyboard";
import { Results } from "../Results/Results";

export function Game() {
  const gameOver = useAppSelector((s) => s.game.endTime !== null);
  return (
    <>
      <Boards />
      {!gameOver ? <Keyboard /> : <Results />}
    </>
  );
}
