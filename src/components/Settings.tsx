import cn from "classnames";
import { useDispatch } from "react-redux";
import { hidePopups, updateSettings, useSelector, startGame } from "../store";

export function Settings() {
  const dispatch = useDispatch();
  const shown = useSelector((s) => s.popups.settings);
  //Need this in order to pre-fill game id
  const game = useSelector((s) => s.game);
  const {
    colorBlindMode,
    showTimer,
    wideMode,
    hideCompletedBoards,
    hideKeyboard,
  } = useSelector((s) => s.settings);
  const handleChooseID = () => {
    const res = window.confirm(
      "Are you sure you want to start a new practice duotrigordle?\n" +
        "(Your current progress will be lost)"
    );
    if (!res) return;
    const inputfield = document.getElementById("custom-input") as HTMLInputElement;
    if (inputfield != null){
      const id = parseInt(inputfield.value);
      dispatch(startGame({id, practice: true }));
      dispatch(hidePopups())
    }
  };
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
        <div className="group">
          {game.practice ? (
            <>
              Custom Game ID:&nbsp;
              <input
                type="number"
                id="custom-input"
                name="custom-input"
                size={10}
                min={1}
                max={4294967295}
                defaultValue={game.id}
                //https://stackoverflow.com/questions/48991254/reactjs-input-defaultvalue-is-set-but-not-showing}
                key = {Math.random()}
                />
              &nbsp;
              <button className="close" onClick={handleChooseID}>
                Play
              </button>
              </>
          ) : (
            <>
              <div></div>
            </>
          )}
        </div>
        <button className="close" onClick={() => dispatch(hidePopups())}>
          close
        </button>
      </div>
    </div>
  );
}
