import cn from "classnames";
import { CSSProperties, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  getGuessColors,
  inputBackspace,
  inputEnter,
  inputLetter,
  NUM_BOARDS,
  useSelector,
} from "../store";
import { range } from "../util";

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

  useEffect(() => {
    const handler = (k: KeyboardEvent) => {
      if (k.ctrlKey || k.metaKey || k.altKey) {
        return;
      }
      const key = k.key.toUpperCase();
      if (key === "BACKSPACE") {
        dispatch(inputBackspace());
      } else if (key === "ENTER") {
        dispatch(inputEnter());
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
    <div className={cn("keyboard", props.hidden && "hidden")}>
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
  char: "backspace" | `enter-${1 | 2 | 3}` | string;
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
      ? () => dispatch(inputEnter())
      : () => dispatch(inputLetter({ letter: props.char }));

  const targets = useSelector((s) => s.targets);
  const guesses = useSelector((s) => s.guesses);

  const styles = useMemo(
    () => generateStyles(char, targets, guesses),
    [char, targets, guesses]
  );

  return (
    <div className={cn("key", enterClass)} style={styles} onClick={handleClick}>
      <span>{char}</span>
    </div>
  );
}

function generateStyles(
  letter: string,
  targets: string[],
  guesses: string[]
): CSSProperties {
  if (!ALPHABET.has(letter)) {
    return {};
  }
  guesses = guesses.filter((x) => x.includes(letter));
  if (guesses.length === 0) {
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
  for (let i = 0; i < targets.length; i++) {
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
  }

  // Generate background image
  const backgroundImage = [];
  for (let i = 0; i < 8; i++) {
    const row = [];
    for (let j = 0; j < 4; j++) {
      const color = colors[i * 4 + j];
      const cell = `${color} calc(100%*${j}/4), ${color} calc(100%*${j + 1}/4)`;
      row.push(cell);
    }
    backgroundImage.push(`linear-gradient(90deg,${row.join(",")})`);
  }
  const backgroundSize = `100% 25%`;
  const backgroundPosition = range(8)
    .map((i) => `0% calc(100%*${i}/7)`)
    .join(",");

  console.log(backgroundImage.join(","));
  return {
    backgroundImage: backgroundImage.join(","),
    backgroundSize,
    backgroundPosition,
    color: "var(--black)",
  };
}
