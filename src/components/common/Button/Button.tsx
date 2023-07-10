import cn from "classnames";
import { ReactNode } from "react";
import { assertNever } from "../../../util";
import styles from "./Button.module.css";

type ButtonProps = {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
  value?: string;
  size?: "normal" | "small";
  type?: "button" | "submit";
  disabled?: boolean;
};
export function Button(props: ButtonProps) {
  const type = props.type ?? "button";
  const className = cn(
    styles.button,
    props.size === "small" && styles.small,
    props.className
  );
  if (type === "button") {
    return (
      <button
        onClick={props.onClick}
        className={className}
        type={type}
        disabled={props.disabled}
      >
        {props.children}
      </button>
    );
  } else if (type === "submit") {
    return (
      <input
        className={className}
        type="submit"
        value={props.value}
        onClick={props.onClick}
        disabled={props.disabled}
      />
    );
  } else {
    assertNever(type);
  }
}
