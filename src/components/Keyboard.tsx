import cn from "classnames";
import { CSSProperties, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { getGuessColors, range } from "../funcs";
import { inputBackspace, inputEnter, inputLetter, useSelector } from "../store";

const ALPHABET = new Set([
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
]);

type KeyboardProps = {
  hidden: boolean;
};
export default function Keyboard(props: KeyboardProps) {
  const dispatch = useDispatch();
  const hideKeyboard = useSelector((s) => s.settings.hideKeyboard);

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

  const wideMode = useSelector((s) => s.settings.wideMode);
  const hideCompletedBoards = useSelector(
    (s) => s.settings.hideCompletedBoards
  );

  const styles = useMemo(
    () => generateStyles(char, targets, guesses, wideMode, hideCompletedBoards),
    [char, targets, guesses, wideMode, hideCompletedBoards]
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
  letter: string,
  targets: string[],
  guesses: string[],
  wideMode: boolean,
  hideCompletedBoards: boolean
): CSSProperties {
  if (!ALPHABET.has(letter)) {
    return {};
  }
  const guessesContainingLetter = guesses.filter((x) => x.includes(letter));
  if (guessesContainingLetter.length === 0) {
    return {};
  }

  const colors = [];
  const completes = [];
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    let bestColor = "B";
    let complete = false;
    for (const guess of guesses) {
      const results = getGuessColors(guess, target);
      for (let j = 0; j < 5; j++) {
        if (guess[j] !== letter) continue;
        const color = results[j];
        if (bestColor === "B" || color === "G") {
          bestColor = color;
        }
      }
      if (guess === target) {
        complete = true;
        break;
      }
    }
    colors.push(bestColor);
    completes.push(complete);
  }

  // If all complete or B, then fade style
  let all = true;
  for (let i = 0; i < targets.length; i++) {
    if (!completes[i] && colors[i] !== "B") {
      all = false;
    }
  }
  if (all) {
    return {
      background: "var(--guess-gray)",
      filter: "contrast(0.5) brightness(0.5)",
    };
  }

  // Otherwise, compute style
  for (let i = targets.length - 1; i >= 0; i--) {
    // If complete, replace color with black
    if (completes[i]) {
      colors[i] = "B";
    }
    // Replace with vars
    if (colors[i] === "B") {
      colors[i] = "var(--guess-gray)";
    } else if (colors[i] === "Y") {
      colors[i] = "var(--guess-yellow)";
    } else if (colors[i] === "G") {
      colors[i] = "var(--guess-green)";
    }

    // If hideCompletedBoards is true, move the colors for
    // completed boards to the back of the arrays so that the
    // generated background will compensate for the hidden boards
    if (hideCompletedBoards && completes[i]) {
      completes.push(completes.splice(i, 1)[0]);
      colors.push(colors.splice(i, 1)[0]);
    }
  }

  // Generate background image
  // Set up vars so that background image lines up with boards regardless of whether wide mode is on
  const [rows, columns, verticalScale] = wideMode ? [4, 8, 26] : [8, 4, 15];

  const backgroundImage = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      const color = colors[i * columns + j];
      row.push(`${color} calc(100%*${j}/${columns})`);
      row.push(`${color} calc(100%*${j + 1}/${columns})`);
    }
    backgroundImage.push(`linear-gradient(90deg,${row.join(",")})`);
  }
  const backgroundSize = `100% ${verticalScale}%`;
  const backgroundPosition = range(rows)
    .map((i) => `0% calc(100%*${i}/${rows - 1} - 1%)`)
    .join(",");

  return {
    backgroundImage: backgroundImage.join(","),
    backgroundSize,
    backgroundPosition,
    color: "var(--black)",
  };
}
