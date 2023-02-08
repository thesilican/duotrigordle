import cn from "classnames";
import { useEffect, useState } from "react";
import { settingsAction, useAppDispatch, useAppSelector } from "../../store";
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
    kofiEmail,
    stickyInput,
    showHints,
  } = useAppSelector((s) => s.settings);

  return (
    <Modal shown={shown}>
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

  function handleClick() {
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
        The following options are for{" "}
        <a target="_blank" href="https://ko-fi.com/thesilican" rel="noreferrer">
          ko-fi supporters
        </a>{" "}
        only
        <br />
        Enter the email you used to donate:
      </p>
      <div className={styles.kofiInputGroup}>
        <input
          type="email"
          className={styles.email}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="button"
          onClick={handleClick}
          value={kofiEmail ? "Reset" : "Submit"}
        />
      </div>
      <p className={styles.hint}>
        {statusCode === 1 ? (
          <>
            Not a valid supporter email
            <br />
            (Contact{" "}
            <a href="mailto:bryanchen74@gmail.com">bryanchen74@gmail.com</a> for
            any issues)
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
