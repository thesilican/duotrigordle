import cn from "classnames";
import { useDispatch } from "react-redux";
import { hidePopups, updateSettings, useSelector } from "../store";

export function Settings() {
  const dispatch = useDispatch();
  const shown = useSelector((s) => s.popups.settings);
  const {
    colorBlindMode,
    showTimer,
    speedrunMode,
    wideMode,
    hideCompletedBoards,
    animateHiding,
    hideKeyboard,
  } = useSelector((s) => s.settings);

  return (
    <div className={cn("popup-wrapper", !shown && "hidden")}>
      <div className="popup">
        <div className="group">
          <input
            type="checkbox"
            id="colorblind-mode"
            checked={colorBlindMode}
            onChange={(e) =>
              dispatch(updateSettings({ colorBlindMode: e.target.checked }))
            }
          />
          <label htmlFor="colorblind-mode">Colorblind mode</label>
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
        <div className="group">
          <input
            type="checkbox"
            id="speedrun-mode"
            checked={speedrunMode}
            onChange={(e) =>
              dispatch(updateSettings({ speedrunMode: e.target.checked }))
            }
          />
          <label htmlFor="speedrun-mode">Speedrun mode</label>
        </div>
        <div className="group">
          <input
            type="checkbox"
            id="wide-mode"
            checked={wideMode}
            onChange={(e) =>
              dispatch(updateSettings({ wideMode: e.target.checked }))
            }
          />
          <label htmlFor="wide-mode">Wide mode</label>
        </div>
        <div className="group">
          <input
            type="checkbox"
            id="hide-completed-boards"
            checked={hideCompletedBoards}
            onChange={(e) =>
              dispatch(
                updateSettings({ hideCompletedBoards: e.target.checked })
              )
            }
          />
          <label htmlFor="hide-completed-boards">Hide completed boards</label>
        </div>
        <div
          className={cn(
            "group",
            "animate-hiding",
            !hideCompletedBoards && "active"
          )}
        >
          <input
            type="checkbox"
            id="animate-hiding"
            checked={animateHiding}
            onChange={(e) =>
              dispatch(updateSettings({ animateHiding: e.target.checked }))
            }
            disabled={!hideCompletedBoards}
          />
          <label htmlFor="animate-hiding">Fade out</label>
        </div>
        <div className="group">
          <input
            type="checkbox"
            id="hide-keyboard"
            checked={hideKeyboard}
            onChange={(e) =>
              dispatch(updateSettings({ hideKeyboard: e.target.checked }))
            }
          />
          <label htmlFor="hide-keyboard">Hide keyboard</label>
        </div>
        <button className="close" onClick={() => dispatch(hidePopups())}>
          close
        </button>
      </div>
    </div>
  );
}
