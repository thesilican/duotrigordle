import cn from "classnames";
import { ReactNode } from "react";
import { uiAction, useAppDispatch } from "../../../store";
import { Button } from "../Button/Button";
import { modal, modalWrapper } from "./Modal.module.css";

type ModalProps = {
  shown?: boolean;
  children?: ReactNode;
  className?: string;
};
export function Modal(props: ModalProps) {
  const dispatch = useAppDispatch();
  if (!props.shown) {
    return null;
  }
  return (
    <div className={modalWrapper}>
      <div className={cn(modal)}>
        {props.children}
        <Button onClick={() => dispatch(uiAction.showModal(null))}>
          close
        </Button>
      </div>
    </div>
  );
}
