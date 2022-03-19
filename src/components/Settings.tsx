import cn from "classnames";
import { useDispatch } from "react-redux";
import { hidePopups, useSelector } from "../store";

export function Settings() {
  const dispatch = useDispatch();
  const shown = useSelector((s) => s.popups.settings);
  return (
    <div className={cn("popup-wrapper", !shown && "hidden")}>
      <div className="popup">
        <button className="close" onClick={() => dispatch(hidePopups())}>
          close
        </button>
      </div>
    </div>
  );
}
