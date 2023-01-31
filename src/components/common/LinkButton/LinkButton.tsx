import { ReactNode } from "react";
import { linkButton } from "./LinkButton.module.css";
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
