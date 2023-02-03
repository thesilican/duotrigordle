import { useState } from "react";
import styles from "./AdBox.module.css";
const { adBox, hidden } = styles;
import cn from "classnames";

export function AdBox() {
  const [isHidden, setIsHidden] = useState(true);
  return <div className={cn(adBox, isHidden && hidden)}></div>;
}
