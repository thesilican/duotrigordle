import { CSSProperties, useMemo } from "react";
import {
  ALPHABET,
  Challenge,
  gameAction,
  getCompletedBoards,
  getSequenceVisibleBoard,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import cn from "classnames";
import { range } from "../../util";
import styles from "./Keyboard.module.css";

export function Keyboard() {
  const disableAnimations = useAppSelector((s) => s.settings.disableAnimations);

  return (
    <div
      className={cn(
        styles.keyboard,
        disableAnimations && styles.disableAnimations
      )}
    >
      <div className={styles.row1}>
        <Key char="Q" />
        <Key char="W" />
        <Key char="E" />
        <Key char="R" />
        <Key char="T" />
        <Key char="Y" />
        <Key char="U" />
        <Key char="I" />
        <Key char="O" />
        <Key char="P" />
      </div>
      <div className={styles.row2}>
        <div className={styles.spacer} />
        <Key char="A" />
        <Key char="S" />
        <Key char="D" />
        <Key char="F" />
        <Key char="G" />
        <Key char="H" />
        <Key char="J" />
        <Key char="K" />
        <Key char="L" />
        <div className={styles.spacer} />
      </div>
      <div className={styles.row3}>
        <Key char="backspace" />
        <Key char="Z" />
        <Key char="X" />
        <Key char="C" />
        <Key char="V" />
        <Key char="B" />
        <Key char="N" />
        <Key char="M" />
        <Key char="enter" />
      </div>
    </div>
  );
}

type KeyProps = {
  char: string;
};
function Key(props: KeyProps) {
  const dispatch = useAppDispatch();
  const char =
    props.char === "backspace"
      ? "⌫"
      : props.char === "enter"
      ? "⏎"
      : props.char;

  const handleClick =
    props.char === "backspace"
      ? () => dispatch(gameAction.inputBackspace())
      : props.char === "enter"
      ? () => dispatch(gameAction.inputEnter({ timestamp: Date.now() }))
      : () => dispatch(gameAction.inputLetter({ letter: props.char }));

  const targets = useAppSelector((s) => s.game.targets);
  const guesses = useAppSelector((s) => s.game.guesses);
  const guessColors = useAppSelector((s) => s.game.colors);
  const wideMode = useAppSelector((s) => s.settings.wideMode);
  const hideCompletedBoards = useAppSelector(
    (s) => s.settings.hideCompletedBoards
  );
  const highlightedBoard = useAppSelector((s) => s.ui.highlightedBoard);
  const challenge = useAppSelector((s) => s.game.challenge);
  const colorBlind = useAppSelector((s) => s.settings.colorBlindMode);
  const style = useMemo(
    () =>
      generateStyles(
        props.char,
        targets,
        guesses,
        guessColors,
        wideMode,
        hideCompletedBoards,
        highlightedBoard,
        challenge,
        colorBlind
      ),
    [
      props.char,
      targets,
      guesses,
      guessColors,
      wideMode,
      hideCompletedBoards,
      highlightedBoard,
      challenge,
      colorBlind,
    ]
  );

  return (
    <button style={style} className={styles.key} onClick={handleClick}>
      {char}
    </button>
  );
}

function generateStyles(
  char: string,
  targets: string[],
  guesses: string[],
  guessColors: string[][],
  wideMode: boolean,
  hideCompletedBoards: boolean,
  highlightedBoard: number | null,
  challenge: Challenge,
  colorBlind: boolean
): CSSProperties {
  // Don't generate style for backspace & enter keys
  if (!ALPHABET.has(char)) {
    return {};
  }

  // Don't generate style if letter isn't in any guesses yet
  if (!guesses.find((x) => x.includes(char))) {
    return {};
  }

  // Special case: key is just a single solid color
  if (highlightedBoard !== null || challenge === "sequence") {
    let idx: number;
    if (highlightedBoard !== null) {
      idx = highlightedBoard;
    } else if (challenge === "sequence") {
      idx = getSequenceVisibleBoard(targets, guesses);
    } else {
      throw new Error("unreachable");
    }

    let bestColor = "B";
    for (let row = 0; row < guesses.length; row++) {
      for (let i = 0; i < 5; i++) {
        if (guesses[row][i] !== char) continue;
        const color = guessColors[idx][row][i];
        if (bestColor === "B" || color === "G") {
          bestColor = color;
        }
      }
    }

    if (bestColor === "B") {
      return {
        backgroundColor: "var(--black)",
        filter: "contrast(0.5) brightness(0.5)",
      };
    } else if (bestColor === "Y") {
      return {
        backgroundColor: colorBlind ? "var(--orange)" : "var(--yellow)",
        color: "var(--black)",
      };
    } else if (bestColor === "G") {
      return {
        backgroundColor: colorBlind ? "var(--blue)" : "var(--green)",
        color: "var(--black)",
      };
    }
  }

  // For the ith board, colors[i]
  // is B if the letter is wrong, or the board is completed
  // is Y if any guess has Y (but no G)
  // is G if any guess has G
  // If hideCompletedBoards is on, don't push a color
  // instead increment the pad count
  let colors = [];
  let pad = 0;
  const completedBoards = getCompletedBoards(targets, guesses);
  for (let board = 0; board < targets.length; board++) {
    // Check if board is complete
    if (completedBoards[board]) {
      if (hideCompletedBoards) {
        pad++;
      } else {
        colors.push("B");
      }
      continue;
    }
    // Push best color
    let bestColor = "B";
    for (let row = 0; row < guesses.length; row++) {
      for (let i = 0; i < 5; i++) {
        if (guesses[row][i] !== char) continue;
        const color = guessColors[board][row][i];
        if (bestColor === "B" || color === "G") {
          bestColor = color;
        }
      }
    }
    colors.push(bestColor);
  }
  for (let i = 0; i < pad; i++) {
    colors.push("B");
  }

  // If all B, then fade key out
  if (!colors.find((x) => x !== "B")) {
    return {
      backgroundColor: "var(--black)",
      filter: "contrast(0.5) brightness(0.5)",
    };
  }

  // Generate background image
  return wideMode
    ? generateBackgroundGrid(colors, 4, 8, colorBlind)
    : generateBackgroundGrid(colors, 8, 4, colorBlind);
}

function generateBackgroundGrid(
  colors: string[],
  rows: number,
  columns: number,
  colorBlind: boolean
): CSSProperties {
  const yellow = colorBlind ? "var(--orange)" : "var(--yellow)";
  const green = colorBlind ? "var(--blue)" : "var(--green)";
  const gray = colorBlind ? "var(--gray-3)" : "var(--gray-6)";

  const backgroundImage = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      const color = colors[i * columns + j];
      const colorVal =
        color === "Y" ? yellow : color === "G" ? green : "transparent";
      row.push(`${colorVal} calc(100%*${j}/${columns})`);
      row.push(`${colorVal} calc(100%*${j + 1}/${columns})`);
    }
    backgroundImage.push(`linear-gradient(90deg,${row.join(",")})`);
  }
  const backgroundSize = `100% calc(110%/${rows})`;
  const backgroundPosition = range(rows)
    .map((i) => `0% calc(${i}/${rows - 1}*100%)`)
    .join(",");

  return {
    backgroundColor: gray,
    backgroundImage: backgroundImage.join(","),
    backgroundSize,
    backgroundPosition,
    color: "var(--black)",
  };
}
