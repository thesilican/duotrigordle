import cn from "classnames";
import React, { useState } from "react";
import { range } from "../../util";
import {
  animate,
  black,
  board,
  boards,
  cell,
  green,
  hidden,
  highlighted,
  letter,
  sticky,
  textGhost,
  textRed,
  textYellow,
  yellow,
} from "./Boards.module.css";

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
function Board({ idx }: BoardProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  return (
    <div
      className={cn(
        board,
        isHighlighted && highlighted,
        isHidden && hidden,
        animate
      )}
      onClick={() => setIsHighlighted(!isHighlighted)}
    >
      {range(37).map((i) => (
        <Row key={i} idx={i} />
      ))}
    </div>
  );
}

type RowProps = {
  idx: number;
};
function Row({ idx }: RowProps) {
  const threshold = 30;
  return (
    <>
      {range(5).map((i) => {
        const color =
          idx < threshold
            ? Math.random() < 0.5
              ? "B"
              : Math.random() < 0.5
              ? "Y"
              : "G"
            : undefined;
        const char = idx < threshold ? "P" : idx === threshold ? "F" : "";
        return (
          <Cell
            key={i}
            char={char}
            color={color}
            textColor={idx === threshold ? "ghost" : undefined}
            sticky={idx === threshold}
          />
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
const Cell = React.memo((props: CellProps) => {
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
