import cn from "classnames";
import { ChangeEvent, useState } from "react";
import { apiValidateEmail } from "../../api";
import {
  settingsAction,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { assertNever } from "../../util";
import { Checkbox } from "../common/Checkbox/Checkbox";
import { Modal } from "../common/Modal/Modal";
import styles from "./Settings.module.css";

export function Settings() {
  const dispatch = useAppDispatch();
  const shown = useAppSelector((s) => s.ui.modal === "settings");
  const {
    colorBlindMode,
    showTimer,
    wideMode,
    disableAnimations,
    hideAds,
    hideCompletedBoards,
    hideEmptyRows,
    kofiEmail,
    stickyInput,
    showHints,
    swapBackspaceEnter,
  } = useAppSelector((s) => s.settings);

  return (
    <Modal shown={shown} onClose={() => dispatch(uiAction.showModal(null))}>
      <p className={styles.title}>Settings</p>
      <div className={styles.settingsList}>
        <div className={styles.setting}>
          <Checkbox
            checked={colorBlindMode}
            onChange={(x) =>
              dispatch(settingsAction.update({ colorBlindMode: x }))
            }
            id="color-blind-mode"
          />
          <label className={styles.label} htmlFor="color-blind-mode">
            <p className={styles.name}>Colorblind Mode</p>
            <p className={styles.description}>Uses higher contrast colors</p>
          </label>
        </div>
        <div className={styles.setting}>
          <Checkbox
            checked={showTimer}
            onChange={(x) => dispatch(settingsAction.update({ showTimer: x }))}
            id="show-timer"
          />
          <label className={styles.label} htmlFor="show-timer">
            <p className={styles.name}>Show Speedrun Timer</p>
            <p className={styles.description}>For pro gamers</p>
          </label>
        </div>
        <div className={styles.setting}>
          <Checkbox
            checked={wideMode}
            onChange={(x) => dispatch(settingsAction.update({ wideMode: x }))}
            id="wide-mode"
          />
          <label className={styles.label} htmlFor="wide-mode">
            <p className={styles.name}>Wide Mode</p>
            <p className={styles.description}>8 boards per column</p>
          </label>
        </div>
        <hr className={styles.seperator} />
        <div className={styles.setting}>
          <Checkbox
            checked={hideCompletedBoards}
            onChange={(x) =>
              dispatch(settingsAction.update({ hideCompletedBoards: x }))
            }
            id="hide-completed-boards"
          />
          <label className={styles.label} htmlFor="hide-completed-boards">
            <p className={styles.name}>Hide Completed Boards</p>
            <p className={styles.description}>
              Boards are hidden when completed
            </p>
          </label>
        </div>
        <div className={styles.setting}>
          <Checkbox
            checked={hideEmptyRows}
            onChange={(x) =>
              dispatch(settingsAction.update({ hideEmptyRows: x }))
            }
            id="hide-empty-rows"
          />
          <label className={styles.label} htmlFor="hide-empty-rows">
            <p className={styles.name}>Hide Empty Rows</p>
            <p className={styles.description}>Empty rows are collapsed</p>
          </label>
        </div>
        <div className={styles.setting}>
          <Checkbox
            checked={stickyInput}
            onChange={(x) =>
              dispatch(settingsAction.update({ stickyInput: x }))
            }
            id="sticky-input"
          />
          <label className={styles.label} htmlFor="sticky-input">
            <p className={styles.name}>Sticky Input Field</p>
            <p className={styles.description}>
              Input fields stick to the bottom when scrolling
            </p>
          </label>
        </div>
        <div className={styles.setting}>
          <Checkbox
            checked={showHints}
            onChange={(x) => dispatch(settingsAction.update({ showHints: x }))}
            id="show-hints"
          />
          <label className={styles.label} htmlFor="show-hints">
            <p className={styles.name}>Show Hints</p>
            <p className={styles.description}>
              Show ghost letters and inconsistency warnings
            </p>
          </label>
        </div>
        <div className={styles.setting}>
          <Checkbox
            checked={swapBackspaceEnter}
            onChange={(x) =>
              dispatch(settingsAction.update({ swapBackspaceEnter: x }))
            }
            id="swap-backspace-enter"
          />
          <label className={styles.label} htmlFor="swap-backspace-enter">
            <p className={styles.name}>Swap Backspace/Enter</p>
            <p className={styles.description}>
              Makes keyboard consistent with Wordle
            </p>
          </label>
        </div>
        <div className={styles.setting}>
          <Checkbox
            checked={disableAnimations}
            onChange={(x) =>
              dispatch(settingsAction.update({ disableAnimations: x }))
            }
            id="disable-animations"
          />
          <label className={styles.label} htmlFor="disable-animations">
            <p className={styles.name}>Disable Animations</p>
            <p className={styles.description}>
              Disable all game animations. May improve performance
            </p>
          </label>
        </div>
        <hr className={styles.seperator} />
        <KofiEmailInput />
        <div className={cn(styles.setting, !kofiEmail && styles.disabled)}>
          <Checkbox
            disabled={!kofiEmail}
            checked={hideAds}
            onChange={(x) => dispatch(settingsAction.update({ hideAds: x }))}
            id="hide-ads"
          />
          <label className={styles.label} htmlFor="hide-ads">
            <p className={styles.name}>Hide Ads</p>
            <p className={styles.description}>Thank you for your support!</p>
          </label>
        </div>
      </div>
    </Modal>
  );
}

function KofiEmailInput() {
  const dispatch = useAppDispatch();
  const kofiEmail = useAppSelector((s) => s.settings.kofiEmail);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<null | "error" | "success">(null);

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    setStatus(null);
  }

  function handleSubmit() {
    if (kofiEmail) {
      dispatch(settingsAction.update({ hideAds: false, kofiEmail: null }));
      setStatus(null);
    } else {
      apiValidateEmail(dispatch, input).then((x) => {
        if (x === true) {
          setStatus("success");
        } else if (x === false) {
          setStatus("error");
        }
      });
    }
  }
  return (
    <div className={styles.kofiEmailInput}>
      <p className={styles.hint}>
        These options are available for{" "}
        <a target="_blank" href="https://ko-fi.com/thesilican" rel="noreferrer">
          ko-fi supporters
        </a>
        <br />
        Enter the email you used to donate:
      </p>
      <form
        className={styles.kofiInputGroup}
        onSubmit={(e) => {
          handleSubmit();
          e.preventDefault();
        }}
      >
        <input
          type="email"
          className={styles.email}
          value={kofiEmail ?? input}
          onChange={handleInput}
          disabled={kofiEmail !== null}
          required
        />
        <input
          className={styles.submit}
          type="submit"
          value={kofiEmail ? "Reset" : "Submit"}
        />
      </form>
      <p className={styles.hint}>
        {status === "error" ? (
          <>
            Not a valid supporter email (Contact{" "}
            <a href="mailto:bryan.chen@duotrigordle.com">
              bryan.chen@duotrigordle.com
            </a>{" "}
            for any issues)
          </>
        ) : status === "success" ? (
          <>Success!</>
        ) : status === null ? null : (
          assertNever(status)
        )}
      </p>
    </div>
  );
}
