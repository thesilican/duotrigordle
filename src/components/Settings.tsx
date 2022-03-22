import cn from "classnames";
import { useDispatch } from "react-redux";
import { hidePopups, updateSettings, useSelector } from "../store";

export function Settings() {
  const dispatch = useDispatch();
  const shown = useSelector((s) => s.popups.settings);
  const colorBlindMode = useSelector((s) => s.settings.colorBlindMode);
  const showTimer = useSelector((s) => s.settings.showTimer);

  return (
    <div className={cn("popup-wrapper", !shown && "hidden")}>
      <div className="popup">
        <div className="group">
          <input
            type="checkbox"
            id="hide-keyboard"
            checked={colorBlindMode}
            onChange={(e) =>
              dispatch(updateSettings({ colorBlindMode: e.target.checked }))
            }
          />
          <label htmlFor="hide-keyboard">Colorblind mode</label>
        </div>
        <div className="group">
          <input
            type="checkbox"
            id="show-timer"
            checked={showTimer}
            onChange={(e) =>
              dispatch(updateSettings({ showTimer: e.target.checked }))
            }
          />
          <label htmlFor="show-timer">Show speedrun timer</label>
        </div>
        <button className="close" onClick={() => dispatch(hidePopups())}>
          close
        </button>
      </div>
    </div>
  );
}
