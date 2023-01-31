import { useState } from "react";
import { adBox, hidden } from "./AdBox.module.css";
import cn from "classnames";

export function AdBox() {
  const [isHidden, setIsHidden] = useState(true);
  return <div className={cn(adBox, isHidden && hidden)}></div>;
}
