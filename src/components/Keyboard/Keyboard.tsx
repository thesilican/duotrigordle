import { CSSProperties, useMemo } from "react";
import {
  ALPHABET,
  gameAction,
  getCompletedBoards,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { range } from "../../util";
import styles from "./Keyboard.module.css";

export function Keyboard() {
  return (
    <div className={styles.keyboard}>
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
  const style = useMemo(
    () =>
      generateStyles(
        props.char,
        targets,
        guesses,
        guessColors,
        wideMode,
        hideCompletedBoards,
        highlightedBoard
      ),
    [
      guessColors,
      guesses,
      hideCompletedBoards,
      highlightedBoard,
      props.char,
      targets,
      wideMode,
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
  highlightedBoard: number | null
): CSSProperties {
  const completedBoards = getCompletedBoards(targets, guesses);

  // Don't generate style for backspace & enter keys
  if (!ALPHABET.has(char)) {
    return {};
  }

  // Don't generate style if letter isn't in any guesses yet
  if (!guesses.find((x) => x.includes(char))) {
    return {};
  }

  // For board i, colors[i]
  // is B if the letter is wrong, or the board is completed
  // is Y if any guess has Y (but no G)
  // is G if any guess has G
  let colors = [];
  // Pad count if hideCompletedBoards is on
  let pad = 0;
  for (let i = 0; i < targets.length; i++) {
    // Check if board is complete
    if (completedBoards[i] !== null) {
      if (hideCompletedBoards && highlightedBoard === null) {
        pad++;
      } else {
        colors.push("B");
      }
      continue;
    }
    // Push best color
    let bestColor = "B";
    for (let j = 0; j < guesses.length; j++) {
      const guess = guesses[j];
      const results = guessColors[i][j];
      for (let k = 0; k < 5; k++) {
        if (guess[k] !== char) continue;
        const color = results[k];
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

  // Special case: if highlighted board, then the array contains just one element
  if (highlightedBoard !== null) {
    if (colors[highlightedBoard] === "B") {
      return {
        backgroundColor: "var(--black)",
        filter: "contrast(0.5) brightness(0.5)",
      };
    } else if (colors[highlightedBoard] === "Y") {
      return {
        backgroundColor: "var(--yellow)",
        color: "var(--black)",
      };
    } else if (colors[highlightedBoard] === "G") {
      return {
        backgroundColor: "var(--green)",
        color: "var(--black)",
      };
    }
  }

  // If all B, then fade style
  if (!colors.find((x) => x !== "B")) {
    return {
      backgroundColor: "var(--black)",
      filter: "contrast(0.5) brightness(0.5)",
    };
  }

  // Generate background image
  return wideMode
    ? generateBackgroundGrid(colors, 4, 8)
    : generateBackgroundGrid(colors, 8, 4);
}

function generateBackgroundGrid(
  colors: string[],
  rows: number,
  columns: number
): CSSProperties {
  const backgroundImage = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      const color = colors[i * columns + j];
      const colorVal =
        color === "Y"
          ? "var(--yellow)"
          : color === "G"
          ? "var(--green)"
          : "transparent";
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
    backgroundColor: "var(--gray-6)",
    backgroundImage: backgroundImage.join(","),
    backgroundSize,
    backgroundPosition,
    color: "var(--black)",
  };
}
