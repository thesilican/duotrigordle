import cn from "classnames";
import { ReactNode } from "react";
import styles from "./LinkButton.module.css";

type LinkButtonProps = {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
};

export function LinkButton({ className, onClick, children }: LinkButtonProps) {
  return (
    <button className={cn(className, styles.linkButton)} onClick={onClick}>
      {children}
    </button>
  );
}
