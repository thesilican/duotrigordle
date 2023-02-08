import cn from "classnames";
import React, { useEffect, useMemo, useRef } from "react";
import {
  getGhostLetters,
  getSequenceVisibleBoard,
  getWarnHint,
  NUM_BOARDS,
  NUM_GUESSES,
  uiAction,
  useAppDispatch,
  useAppSelector,
  WORDS_VALID,
} from "../../store";
import { range } from "../../util";
import styles from "./Boards.module.css";

export function Boards() {
  const wideMode = useAppSelector((s) => s.settings.wideMode);
  const colorBlind = useAppSelector((s) => s.settings.colorBlindMode);

  return (
    <div
      className={cn(
        styles.boards,
        wideMode && styles.wide,
        colorBlind && styles.colorBlind
      )}
    >
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
  const targets = useAppSelector((s) => s.game.targets);
  const guesses = useAppSelector((s) => s.game.guesses);
  const gameOver = useAppSelector((s) => s.game.gameOver);
  const isHighlighted = useAppSelector(
    (s) => s.ui.highlightedBoard === props.idx
  );
  const guessColors = useAppSelector((s) => s.game.colors[props.idx]);
  const hideBoard = useAppSelector((s) => s.settings.hideCompletedBoards);
  const animateHiding = useAppSelector((s) => s.settings.animateHiding);
  const hideEmptyRows = useAppSelector((s) => s.settings.hideEmptyRows);
  const challenge = useAppSelector((s) => s.game.challenge);

  const target = targets[props.idx];
  const isConcealed = useMemo(() => {
    if (challenge === "sequence") {
      return props.idx > getSequenceVisibleBoard(targets, guesses);
    } else {
      return false;
    }
  }, [challenge, props.idx, targets, guesses]);
  const guessedAt = guesses.indexOf(target);
  const complete = guessedAt !== -1;
  const coloredCount = complete ? guessedAt + 1 : guesses.length;
  const showInput = !complete && !gameOver && !isConcealed;
  const maxGuesses = challenge === "perfect" ? NUM_BOARDS : NUM_GUESSES;
  const emptyCount = hideEmptyRows
    ? 0
    : maxGuesses - coloredCount - (showInput ? 1 : 0);

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
      dispatch(uiAction.resolveSideEffect(sideEffect.id));
    }
  }, [dispatch, props.idx, sideEffect]);

  return (
    <div
      className={cn(
        styles.board,
        isHighlighted && styles.highlighted,
        isDimmed && styles.dimmed,
        isHidden && styles.hidden,
        animateHiding && styles.animate
      )}
      onClick={() => dispatch(uiAction.highlightClick(props.idx))}
    >
      <div ref={scrollRef} className={styles.scrollIntoView} />
      <ColoredRows
        words={guesses}
        colors={guessColors}
        count={coloredCount}
        concealed={isConcealed}
      />
      {showInput ? <InputRow guesses={guesses} colors={guessColors} /> : null}
      <EmptyRows count={emptyCount} />
    </div>
  );
}

type ColoredRowsProps = {
  words: string[];
  colors: string[];
  count: number;
  concealed: boolean;
};
const ColoredRows = React.memo(function ColoredRows(props: ColoredRowsProps) {
  if (props.concealed) {
    return (
      <>
        {range(props.count * 5).map((i) => (
          <Cell key={i} char="?" color={"B"} />
        ))}
      </>
    );
  }
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
  const showHints = useAppSelector((s) => s.settings.showHints);
  const input = useAppSelector((s) => s.game.input);
  const sticky = useAppSelector((s) => s.settings.stickyInput);

  const ghostLetters = useMemo(
    () =>
      showHints ? getGhostLetters(guesses, colors) : range(5).map(() => ""),
    [showHints, guesses, colors]
  );

  const isError = input.length === 5 && !WORDS_VALID.has(input);
  const isWarn = useMemo(
    () => (showHints ? getWarnHint(input, guesses, colors) : false),
    [showHints, colors, guesses, input]
  );

  return (
    <>
      {range(5).map((i) => {
        let char: string;
        let textColor: "red" | "yellow" | "ghost" | undefined;
        if (!showHints) {
          char = input[i];
          textColor = isError ? "red" : undefined;
        } else {
          char = input[i] ?? ghostLetters[i];
          if (input[i]) {
            textColor = isError ? "red" : isWarn ? "yellow" : undefined;
          } else {
            textColor = ghostLetters[i] ? "ghost" : undefined;
          }
        }
        return (
          <Cell key={i} char={char} textColor={textColor} sticky={sticky} />
        );
      })}
    </>
  );
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
        styles.cell,
        props.color === "B" && styles.black,
        props.color === "Y" && styles.yellow,
        props.color === "G" && styles.green,
        props.textColor === "red" && styles.textRed,
        props.textColor === "yellow" && styles.textYellow,
        props.textColor === "ghost" && styles.textGhost,
        props.sticky && styles.sticky
      )}
    >
      <span className={styles.letter}>{props.char}</span>
    </div>
  );
});
