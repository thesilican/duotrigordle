import cn from "classnames";
import React from "react";
import { range } from "../../funcs";
import {
  black,
  board,
  boards,
  cell,
  green,
  highlighted,
  letter,
  row,
  sticky,
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
  return (
    <div className={cn(board, idx === 0 && highlighted)}>
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
  const threshold = 20;
  return (
    <div className={cn(row, idx === threshold && sticky)}>
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
        return <Cell key={i} char={char} color={color} />;
      })}
    </div>
  );
}

type CellProps = {
  char?: string;
  color?: "B" | "Y" | "G";
  textRed?: boolean;
};
const Cell = React.memo(({ char, color, textRed }: CellProps) => {
  return (
    <div
      className={cn(
        cell,
        color === "B" && black,
        color === "Y" && yellow,
        color === "G" && green
      )}
    >
      <span className={letter}>{char}</span>
    </div>
  );
});
