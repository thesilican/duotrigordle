import cn from "classnames";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import twemoji from "twemoji";
import { START_DATE } from "../consts";
import { showPopup, useSelector } from "../store";

function getHoursRemaining() {
  const diff = Date.now() - START_DATE;
  const hoursRemaining = 24 - ((diff / 1000 / 60 / 60) % 24);
  if (hoursRemaining > 0.95) {
    return hoursRemaining.toFixed(0);
  } else {
    return hoursRemaining.toFixed(1);
  }
}
export default function About() {
  const dispatch = useDispatch();
  const [hoursRemaining, setHoursRemaining] = useState(getHoursRemaining);
  const shown = useSelector((s) => s.ui.popup === "about");

  useEffect(() => {
    // Update hoursRemaining every time popup is opened
    if (shown) {
      setHoursRemaining(getHoursRemaining);
    }
  }, [shown]);

  return (
    <div className={cn("popup-wrapper", !shown && "hidden")}>
      <div className="popup">
        <p>Guess all 32 Duotrigordle words in 37 tries!</p>
        <p>
          A new Daily Duotrigordle will be available in {hoursRemaining} hour
          {hoursRemaining === "1" ? "" : "s"}.
        </p>
        <hr className="separator" />
        <p>Duotrigordle by Bryan Chen</p>
        <p>Board highlight idea by Dr. Om Patel</p>
        <p>
          Source code on{" "}
          <a
            rel="noreferrer"
            target="_blank"
            href="https://github.com/thesilican/duotrigordle"
          >
            GitHub
          </a>
          <div className="kofi">
            <span dangerouslySetInnerHTML={{ __html: twemoji.parse("💛") }} />{" "}
            Duotrigordle?{" "}
            <a
              target="_blank"
              href="https://ko-fi.com/thesilican"
              rel="noreferrer"
            >
              Buy me a{" "}
              <span
                dangerouslySetInnerHTML={{ __html: twemoji.parse("☕️") }}
              />{" "}
              !
            </a>
          </div>
        </p>
        <hr className="separator" />
        <p>Based on</p>
        <ul>
          <li>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://hexadecordle.co.uk/"
            >
              Hexadecordle
            </a>{" "}
            by Alfie Rayner
          </li>
          <li>
            <a rel="noreferrer" target="_blank" href="https://octordle.com/">
              Octordle
            </a>{" "}
            by Kenneth Crawford
          </li>
          <li>
            <a rel="noreferrer" target="_blank" href="https://quordle.com/">
              Quordle
            </a>{" "}
            by @fireph
          </li>
          <li>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://zaratustra.itch.io/dordle"
            >
              Dordle
            </a>{" "}
            by Guilherme S. Töws
          </li>
          <li>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://www.nytimes.com/games/wordle/index.html"
            >
              Wordle
            </a>{" "}
            by Josh Wardle
          </li>
        </ul>
        <hr className="separator" />
        <div className="legal">
          <a
            target="_blank"
            href="https://duotrigordle.com/privacy.html"
            rel="noreferrer"
          >
            Privacy Policy
          </a>
        </div>
        <button className="close" onClick={() => dispatch(showPopup(null))}>
          close
        </button>
      </div>
    </div>
  );
}
