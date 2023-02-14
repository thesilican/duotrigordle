import cn from "classnames";
import { ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
};
export function Button({ className, onClick, children }: ButtonProps) {
  return (
    <button onClick={onClick} className={cn(styles.button, className)}>
      {children}
    </button>
  );
}
