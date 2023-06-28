import cn from "classnames";
import { ReactNode } from "react";
import { Button } from "../Button/Button";
import styles from "./Modal.module.css";

type ModalProps = {
  shown?: boolean;
  children?: ReactNode;
  className?: string;
  noAnimate?: boolean;
  hideCloseButton?: boolean;
  onClose?: () => void;
};
export function Modal(props: ModalProps) {
  return (
    <div
      className={cn(
        styles.modalWrapper,
        !props.noAnimate && styles.animate,
        !props.shown && styles.hidden
      )}
    >
      <div className={styles.modal}>
        {props.children}
        {!props.hideCloseButton && (
          <Button onClick={() => props.onClose?.()}>close</Button>
        )}
      </div>
      <div
        onClick={() => props.onClose?.()}
        className={styles.modalBackground}
      />
    </div>
  );
}
