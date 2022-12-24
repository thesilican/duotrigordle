import cn from "classnames";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { showPopup, updateSettings, useSelector } from "../store";

export function Settings() {
  const dispatch = useDispatch();
  const shown = useSelector((s) => s.ui.popup === "settings");
  const {
    colorBlindMode,
    showTimer,
    wideMode,
    hideCompletedBoards,
    animateHiding,
    hideKeyboard,
    useFloatingInput,
    hideEmptyRows,
    hideAds,
    kofiEmail,
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
        <div className="group">
          <input
            type="checkbox"
            id="show-floating-input"
            checked={useFloatingInput}
            onChange={(e) =>
              dispatch(updateSettings({ useFloatingInput: e.target.checked }))
            }
          />
          <label htmlFor="show-floating-input">Use floating input</label>
        </div>
        <div className="group">
          <input
            type="checkbox"
            id="hide-empty-rows"
            checked={hideEmptyRows}
            onChange={(e) =>
              dispatch(updateSettings({ hideEmptyRows: e.target.checked }))
            }
          />
          <label htmlFor="hide-empty-rows">Hide empty rows</label>
        </div>
        <hr className="separator" />
        <KofiEmailInput />
        <div className={cn("group", "hide-ads", !kofiEmail && "disabled")}>
          <input
            type="checkbox"
            id="hide-ads"
            disabled={!kofiEmail}
            checked={hideAds}
            onChange={(e) =>
              dispatch(updateSettings({ hideAds: e.target.checked }))
            }
          />
          <label htmlFor="hide-ads">Hide ads</label>
        </div>
        <button className="close" onClick={() => dispatch(showPopup(null))}>
          close
        </button>
      </div>
    </div>
  );
}

function KofiEmailInput() {
  const dispatch = useDispatch();
  const kofiEmail = useSelector((s) => s.settings.kofiEmail);
  const [email, setEmail] = useState("");
  // 0 - no error
  // 1 - not a valid kofi email
  // 2 - error communicating with server
  const [errorCode, setErrorCode] = useState(0);

  useEffect(() => {
    if (kofiEmail) {
      setEmail(kofiEmail);
    }
  }, [kofiEmail]);

  function handleClick() {
    if (kofiEmail) {
      setEmail("");
      dispatch(updateSettings({ hideAds: false, kofiEmail: null }));
      setErrorCode(0);
    } else {
      if (!email) {
        setErrorCode(0);
        return;
      }
      const url = new URL("/api/emails/validate", window.location.href);
      url.searchParams.append("email", email);
      fetch(url)
        .then((x) => x.json())
        .then((valid) => {
          if (valid) {
            dispatch(updateSettings({ kofiEmail: email }));
            setErrorCode(0);
          } else {
            setErrorCode(1);
          }
        })
        .catch(() => {
          setErrorCode(2);
        });
    }
  }
  return (
    <>
      <p className="hint">
        The following options are for{" "}
        <a target="_blank" href="https://ko-fi.com/thesilican" rel="noreferrer">
          ko-fi supporters
        </a>{" "}
        only, enter the email you used to donate:
      </p>
      <div className="kofi-email-input">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="button"
          onClick={handleClick}
          value={kofiEmail ? "Reset" : "Submit"}
        />
      </div>
      <p className="hint">
        {errorCode === 1 ? (
          <>
            Not a valid supporter email
            <br />
            (Contact{" "}
            <a href="mailto:bryanchen74@gmail.com">bryanchen74@gmail.com</a> for
            any issues)
          </>
        ) : errorCode === 2 ? (
          <></>
        ) : null}
      </p>
    </>
  );
}
