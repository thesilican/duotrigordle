import cn from "classnames";
import { useEffect, useState } from "react";
import {
  settingsAction,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
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
  const [text, setText] = useState("");
  // 0 - no status
  // 1 - not a valid kofi email
  // 2 - error communicating with server
  // 3 - input field was empty
  // 4 - success
  const [statusCode, setStatusCode] = useState(0);

  useEffect(() => {
    if (kofiEmail) {
      setText(kofiEmail);
    }
  }, [kofiEmail]);

  function handleSubmit() {
    if (kofiEmail) {
      setText("");
      dispatch(settingsAction.update({ hideAds: false, kofiEmail: null }));
      setStatusCode(0);
    } else {
      if (!text) {
        setStatusCode(3);
        return;
      }
      const url = new URL("/api/emails/validate", window.location.href);
      url.searchParams.append("email", text);
      fetch(url)
        .then((x) => x.json())
        .then((valid) => {
          if (valid) {
            dispatch(settingsAction.update({ kofiEmail: text }));
            setStatusCode(4);
          } else {
            setStatusCode(1);
          }
        })
        .catch(() => {
          setStatusCode(2);
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
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={kofiEmail !== null}
        />
        <input
          className={styles.submit}
          type="submit"
          value={kofiEmail ? "Reset" : "Submit"}
        />
      </form>
      <p className={styles.hint}>
        {statusCode === 1 ? (
          <>
            Not a valid supporter email
            <br />
            (Contact{" "}
            <a href="mailto:bryan.chen@duotrigordle.com">
              bryan.chen@duotrigordle.com
            </a>{" "}
            for any issues)
          </>
        ) : statusCode === 2 ? (
          <>There was a problem communicating with the server</>
        ) : statusCode === 3 ? (
          <>Please enter an email</>
        ) : statusCode === 4 ? (
          <>Success!</>
        ) : null}
      </p>
    </div>
  );
}
