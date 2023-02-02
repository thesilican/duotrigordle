import cn from "classnames";
import { useEffect, useState } from "react";
import { settingsAction, useAppDispatch, useAppSelector } from "../../store";
import { Checkbox } from "../common/Checkbox/Checkbox";
import { Modal } from "../common/Modal/Modal";
import {
  description,
  disabled,
  email,
  hint,
  indented,
  kofiEmailInput,
  kofiInputGroup,
  label,
  name,
  seperator,
  setting,
  settingsList,
  title,
} from "./Settings.module.css";

export function Settings() {
  const dispatch = useAppDispatch();
  const shown = useAppSelector((s) => s.ui.modal === "settings");
  const {
    showTimer,
    wideMode,
    animateHiding,
    hideAds,
    hideCompletedBoards,
    kofiEmail,
    stickyInput,
  } = useAppSelector((s) => s.settings);

  return (
    <Modal shown={shown}>
      <p className={title}>Settings</p>
      <div className={settingsList}>
        <div className={setting}>
          <Checkbox
            checked={showTimer}
            onChange={(x) => dispatch(settingsAction.update({ showTimer: x }))}
            id="show-timer"
          />
          <label className={label} htmlFor="show-timer">
            <p className={name}>Show Speedrun Timer</p>
          </label>
        </div>
        <div className={setting}>
          <Checkbox
            checked={wideMode}
            onChange={(x) => dispatch(settingsAction.update({ wideMode: x }))}
            id="wide-mode"
          />
          <label className={label} htmlFor="wide-mode">
            <p className={name}>Wide Mode</p>
            <p className={description}>8 boards per columns</p>
          </label>
        </div>
        <div className={setting}>
          <Checkbox
            checked={hideCompletedBoards}
            onChange={(x) =>
              dispatch(settingsAction.update({ hideCompletedBoards: x }))
            }
            id="hide-completed-boards"
          />
          <label className={label} htmlFor="hide-completed-boards">
            <p className={name}>Hide Completed Boards</p>
          </label>
        </div>
        <div
          className={cn(setting, indented, !hideCompletedBoards && disabled)}
        >
          <Checkbox
            disabled={!hideCompletedBoards}
            checked={animateHiding}
            onChange={(x) =>
              dispatch(settingsAction.update({ animateHiding: x }))
            }
            id="animate-hiding"
          />
          <label className={label} htmlFor="animate-hiding">
            <p className={name}>Fade Out</p>
            <p className={description}>Disabling may improve performance</p>
          </label>
        </div>
        <div className={setting}>
          <Checkbox
            checked={stickyInput}
            onChange={(x) =>
              dispatch(settingsAction.update({ stickyInput: x }))
            }
            id="sticky-input"
          />
          <label className={label} htmlFor="sticky-input">
            <p className={name}>Sticky Input Field</p>
            <p className={description}>Disabling may improve performance</p>
          </label>
        </div>
        <hr className={seperator} />
        <KofiEmailInput />
        <div className={cn(setting, !kofiEmail && disabled)}>
          <Checkbox
            disabled={!kofiEmail}
            checked={hideAds}
            onChange={(x) => dispatch(settingsAction.update({ hideAds: x }))}
            id="hide-ads"
          />
          <label className={label} htmlFor="hide-ads">
            <p className={name}>Hide Ads</p>
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
    <div className={kofiEmailInput}>
      <p className={hint}>
        The following options are for{" "}
        <a target="_blank" href="https://ko-fi.com/thesilican" rel="noreferrer">
          ko-fi supporters
        </a>{" "}
        only
        <br />
        Enter the email you used to donate:
      </p>
      <div className={kofiInputGroup}>
        <input
          type="email"
          className={email}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="button"
          onClick={handleClick}
          value={kofiEmail ? "Reset" : "Submit"}
        />
      </div>
      <p className={hint}>
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
