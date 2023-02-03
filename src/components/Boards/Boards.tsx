import cn from "classnames";
import React, { useEffect, useMemo, useRef } from "react";
import {
  NUM_GUESSES,
  uiAction,
  useAppDispatch,
  useAppSelector,
  WORDS_VALID,
} from "../../store";
import { range } from "../../util";
import styles from "./Boards.module.css";
const {
  animate,
  black,
  board,
  boards,
  cell,
  dimmed,
  green,
  hidden,
  highlighted,
  letter,
  sticky,
  textGhost,
  textRed,
  textYellow,
  yellow,
  scrollIntoView,
} = styles;

export function Boards() {
  return (
    <div className={boards}>
      {range(32).map((i) => (
        <Board key={i} idx={i} />
      ))}
    </div>
  );
}

type BoardProps = {
  idx: number;
};
function Board(props: BoardProps) {
  const dispatch = useAppDispatch();
  const target = useAppSelector((s) => s.game.targets[props.idx]);
  const guesses = useAppSelector((s) => s.game.guesses);
  const gameOver = useAppSelector((s) => s.game.gameOver);
  const isHighlighted = useAppSelector(
    (s) => s.ui.highlightedBoard === props.idx
  );
  const colors = useAppSelector((s) => s.game.colors[props.idx]);
  const hideBoard = useAppSelector((s) => s.settings.hideCompletedBoards);
  const animateHiding = useAppSelector((s) => s.settings.animateHiding);
  const guessedAt = guesses.indexOf(target);
  const complete = guessedAt !== -1;
  const coloredCount = complete ? guessedAt + 1 : guesses.length;
  const showInput = !complete && !gameOver;
  const emptyCount = NUM_GUESSES - coloredCount - (showInput ? 1 : 0);

  const isDimmed = !gameOver && complete && !hideBoard;
  const isHidden = !gameOver && complete && hideBoard;

  const scrollRef = useRef<HTMLDivElement>(null);
  const sideEffect = useAppSelector((s) => s.ui.sideEffects[0]);
  useEffect(() => {
    if (
      sideEffect &&
      sideEffect.type === "scroll-board-into-view" &&
      sideEffect.board === props.idx
    ) {
      scrollRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      console.log("hi");
      dispatch(uiAction.resolveSideEffect(sideEffect.id));
    }
  }, [dispatch, props.idx, sideEffect]);

  return (
    <div
      className={cn(
        board,
        isHighlighted && highlighted,
        isDimmed && dimmed,
        isHidden && hidden,
        animateHiding && animate
      )}
      onClick={() => dispatch(uiAction.highlightClick(props.idx))}
    >
      <div ref={scrollRef} className={scrollIntoView} />
      <ColoredRows words={guesses} colors={colors} count={coloredCount} />
      {showInput ? <InputRow guesses={guesses} colors={colors} /> : null}
      <EmptyRows count={emptyCount} />
    </div>
  );
}

type ColoredRowsProps = {
  words: string[];
  colors: string[];
  count: number;
};
const ColoredRows = React.memo(function ColoredRows(props: ColoredRowsProps) {
  return (
    <>
      {range(props.count * 5).map((i) => {
        const row = Math.floor(i / 5);
        const idx = i % 5;
        return (
          <Cell
            key={i}
            char={props.words[row][idx]}
            color={props.colors[row][idx] as "B"}
          />
        );
      })}
    </>
  );
});

type EmptyRowsProps = {
  count: number;
};
const EmptyRows = React.memo(function EmptyRows(props: EmptyRowsProps) {
  return (
    <>
      {range(props.count * 5).map((i) => (
        <Cell key={i} />
      ))}
    </>
  );
});

type InputRowProps = {
  guesses: string[];
  colors: string[];
};
function InputRow(props: InputRowProps) {
  const { guesses, colors } = props;
  const disableHints = useAppSelector((s) => s.settings.disableHints);
  const input = useAppSelector((s) => s.game.input);
  const sticky = useAppSelector((s) => s.settings.stickyInput);

  const ghostLetters = useMemo(
    () => getGhostLetters(guesses, colors),
    [guesses, colors]
  );

  const isError = input.length === 5 && !WORDS_VALID.has(input);
  const isWarn = useMemo(
    () => (disableHints ? false : getWarnHint(input, guesses, colors)),
    [disableHints, colors, guesses, input]
  );

  return (
    <>
      {range(5).map((i) => {
        let textColor: "red" | "yellow" | "ghost" | undefined;
        if (disableHints) {
          textColor = isError ? "red" : undefined;
        } else if (input[i]) {
          textColor = isError ? "red" : isWarn ? "yellow" : undefined;
        } else {
          textColor = ghostLetters[i] ? "ghost" : undefined;
        }
        let char: string;
        if (disableHints) {
          char = input[i];
        } else {
          char = input[i] ?? ghostLetters[i];
        }
        return (
          <Cell key={i} char={char} textColor={textColor} sticky={sticky} />
        );
      })}
    </>
  );
}

function getGhostLetters(guesses: string[], colors: string[]): string[] {
  const ghostLetters: string[] = range(5).map(() => "");
  for (let i = 0; i < 5; i++) {
    for (let row = 0; row < guesses.length; row++) {
      if (colors[row][i] === "G") {
        ghostLetters[i] = guesses[row][i];
        break;
      }
    }
  }
  return ghostLetters;
}

function getWarnHint(input: string, guesses: string[], colors: string[]) {
  for (let i = 0; i < input.length; i++) {
    for (let row = 0; row < guesses.length; row++) {
      if (colors[row][i] === "G" && input[i] !== guesses[row][i]) {
        return true;
      }
      if (colors[row][i] === "Y" && input[i] === guesses[row][i]) {
        return true;
      }
    }
  }
  return false;
}

type CellProps = {
  char?: string;
  color?: "B" | "Y" | "G";
  textColor?: "red" | "yellow" | "ghost";
  sticky?: boolean;
};
const Cell = React.memo(function Cell(props: CellProps) {
  return (
    <div
      className={cn(
        cell,
        props.color === "B" && black,
        props.color === "Y" && yellow,
        props.color === "G" && green,
        props.textColor === "red" && textRed,
        props.textColor === "yellow" && textYellow,
        props.textColor === "ghost" && textGhost,
        props.sticky && sticky
      )}
    >
      <span className={letter}>{props.char}</span>
    </div>
  );
});
