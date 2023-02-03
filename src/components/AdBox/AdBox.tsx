import cn from "classnames";
import { useState } from "react";
import styles from "./AdBox.module.css";
const { adBox, hidden } = styles;

export function AdBox() {
  const [isHidden, setIsHidden] = useState(true);
  return <div className={cn(adBox, isHidden && hidden)}></div>;
}
