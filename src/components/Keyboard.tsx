import cn from "classnames";
import { CSSProperties, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { ALPHABET } from "../consts";
import { range } from "../funcs";
import {
  inputBackspace,
  inputEnter,
  inputLetter,
  selectGuessColors,
  useSelector,
} from "../store";

type KeyboardProps = {
  hidden: boolean;
};
export default function Keyboard(props: KeyboardProps) {
  const dispatch = useDispatch();
  const hideKeyboard = useSelector((s) => s.settings.hideKeyboard);

  // Listen to keyboard events
  useEffect(() => {
    const handler = (k: KeyboardEvent) => {
      if (k.ctrlKey || k.metaKey || k.altKey) {
        return;
      }
      const key = k.key.toUpperCase();
      if (key === "BACKSPACE") {
        dispatch(inputBackspace());
      } else if (key === "ENTER") {
        dispatch(inputEnter({ timestamp: new Date().getTime() }));
      } else if (ALPHABET.has(key)) {
        dispatch(inputLetter({ letter: key }));
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [dispatch]);

  return (
    <div className={cn("keyboard", (props.hidden || hideKeyboard) && "hidden")}>
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
      <Key char="A" />
      <Key char="S" />
      <Key char="D" />
      <Key char="F" />
      <Key char="G" />
      <Key char="H" />
      <Key char="J" />
      <Key char="K" />
      <Key char="L" />
      <Key char="enter-1" />
      <Key char="backspace" />
      <Key char="Z" />
      <Key char="X" />
      <Key char="C" />
      <Key char="V" />
      <Key char="B" />
      <Key char="N" />
      <Key char="M" />
      <Key char="enter-2" />
      <Key char="enter-3" />
    </div>
  );
}

type KeyProps = {
  char: string;
};
function Key(props: KeyProps) {
  const dispatch = useDispatch();
  const char =
    props.char === "backspace"
      ? "⌫"
      : props.char === "enter-1" || props.char === "enter-2"
      ? ""
      : props.char === "enter-3"
      ? "⏎"
      : props.char;
  const enterClass = props.char.startsWith("enter-") ? props.char : null;
  const handleClick =
    props.char === "backspace"
      ? () => dispatch(inputBackspace())
      : props.char.startsWith("enter-")
      ? () => dispatch(inputEnter({ timestamp: new Date().getTime() }))
      : () => dispatch(inputLetter({ letter: props.char }));

  const targets = useSelector((s) => s.game.targets);
  const guesses = useSelector((s) => s.game.guesses);
  const guessColors = useSelector(selectGuessColors);
  const wideMode = useSelector((s) => s.settings.wideMode);
  const hideCompletedBoards = useSelector(
    (s) => s.settings.hideCompletedBoards
  );

  const styles = useMemo(
    () =>
      generateStyles(
        char,
        targets,
        guesses,
        guessColors,
        wideMode,
        hideCompletedBoards
      ),
    [char, targets, guesses, guessColors, wideMode, hideCompletedBoards]
  );

  return (
    <button
      className={cn("key", enterClass)}
      style={styles}
      onClick={handleClick}
    >
      <span>{char}</span>
    </button>
  );
}

function generateStyles(
  char: string,
  targets: string[],
  guesses: string[],
  guessColors: string[][],
  wideMode: boolean,
  hideCompletedBoards: boolean
): CSSProperties {
  // Don't generate style for backspace & enter keys
  if (!ALPHABET.has(char)) {
    return {};
  }

  // Don't generate style if letter isn't in any guesses yet
  if (!guesses.find((x) => x.includes(char))) {
    return {};
  }

  // For board i, colors[i]
  // is B if the letter is wrong, or the board is completed
  // is Y if any guess has Y (but no G)
  // is G if any guess has G
  const colors = [];
  // Pad count if hideCompletedBoards is on
  let pad = 0;
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const complete = guesses.includes(target);
    // Check if board is complete
    if (complete) {
      if (hideCompletedBoards) {
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

  // If all B, then fade style
  if (!colors.find((x) => x !== "B")) {
    return {
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
          ? "var(--keyboard-yellow)"
          : color === "G"
          ? "var(--keyboard-green)"
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
    backgroundColor: "var(--keyboard-gray)",
    backgroundImage: backgroundImage.join(","),
    backgroundSize,
    backgroundPosition,
    color: "var(--black)",
  };
}
