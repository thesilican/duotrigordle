import { ReactNode } from "react";
import styles from "./LinkButton.module.css";
const { linkButton } = styles;
import cn from "classnames";

type LinkButtonProps = {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
};

export function LinkButton({ className, onClick, children }: LinkButtonProps) {
  return (
    <button className={cn(className, linkButton)} onClick={onClick}>
      {children}
    </button>
  );
}
