import cn from "classnames";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { inputBackspace, inputEnter, inputLetter } from "../store";

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

  return (
    <div className={cn("key", enterClass)} onClick={handleClick}>
      <span>{char}</span>
    </div>
  );
}
