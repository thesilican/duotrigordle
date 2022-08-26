import cn from "classnames";
import React from "react";
import { NUM_BOARDS, WORDS_VALID } from "../consts";
import { range } from "../funcs";
import { selectGuessColors, useSelector } from "../store";

export default function Boards() {
  const input = useSelector((s) => s.game.input);
  const gameOver = useSelector((s) => s.game.gameOver);

  return (
    <div className={cn("boards", "show-input-hint")}>
      {range(NUM_BOARDS).map((i) => (
        <Board key={i} idx={i} />
      ))}
      <div className={cn("input-wrapper", gameOver && "hidden")}>
        <div className="input">
          <div className="word">
            <Word
              letters={input}
              textRed={input.length === 5 && !WORDS_VALID.has(input)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type BoardProps = {
  idx: number;
};
function Board(props: BoardProps) {
  const guesses = useSelector((s) => s.game.guesses);
  const target = useSelector((s) => s.game.targets[props.idx]);
  const gameOver = useSelector((s) => s.game.gameOver);
  const colors = useSelector(selectGuessColors)[props.idx];

  const complete =
    guesses.indexOf(target) !== -1 && !gameOver ? "complete" : null;

  return (
    <div className={cn("board", complete)}>
      <Words guesses={guesses} target={target} colors={colors} />
    </div>
  );
}

type WordsProps = {
  guesses: string[];
  target: string;
  colors: string[];
};
const Words = React.memo(function (props: WordsProps) {
  const { guesses, target, colors } = props;
  const guessedAt = guesses.indexOf(target);
  const complete = guessedAt !== -1;
  const guessCount = complete ? guessedAt + 1 : guesses.length;
  return (
    <>
      {range(guessCount).map((i) => (
        <Word key={i} letters={guesses[i]} colors={colors[i]} />
      ))}
      {guessCount === 0 && <Word letters="" />}
    </>
  );
});

type WordProps = {
  letters: string;
  colors?: string;
  textRed?: boolean;
  inputId?: number;
};
const Word = React.memo(function (props: WordProps) {
  return (
    <>
      {range(5).map((i) => (
        <Cell
          key={i}
          inputId={i === 0 ? props.inputId : undefined}
          char={props.letters[i] ?? ""}
          textRed={props.textRed}
          color={props.colors ? (props.colors[i] as "B") : undefined}
        />
      ))}
    </>
  );
});

type CellProps = {
  char: string;
  color?: "B" | "Y" | "G";
  inputId?: number;
  textRed?: boolean;
};
function Cell(props: CellProps) {
  const color =
    props.color === "Y"
      ? "yellow"
      : props.color === "G"
      ? "green"
      : props.color === "B"
      ? "gray"
      : null;
  const textRed = props.textRed ? "text-red" : null;
  const id =
    props.inputId !== undefined ? `input-${props.inputId + 1}` : undefined;
  return (
    <div id={id} className={cn("cell", color, textRed)}>
      <span className="letter">{props.char}</span>
    </div>
  );
}
