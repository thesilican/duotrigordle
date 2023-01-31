import { ReactNode } from "react";
import { button } from "./Button.module.css";
import cn from "classnames";

type ButtonProps = {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
};
export function Button({ className, onClick, children }: ButtonProps) {
  return (
    <button onClick={onClick} className={cn(button, className)}>
      {children}
    </button>
  );
}
