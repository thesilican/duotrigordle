import { useEffect, useState } from "react";
import twemoji from "twemoji";
import { START_DATE, useAppSelector } from "../../store";
import { Modal } from "../common/Modal/Modal";
import styles from "./About.module.css";
const { emoji, kofi, footer, seperator, title } = styles;

export function About() {
  const shown = useAppSelector((s) => s.ui.modal === "about");

  return (
    <Modal shown={shown}>
      <p className={title}>About</p>
      <p>Guess all 32 Duotrigordle words in 37 tries!</p>
      <TimeRemaining />
      <hr className={seperator} />
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
      </p>
      <div className={kofi}>
        <span
          className={emoji}
          dangerouslySetInnerHTML={{ __html: twemoji.parse("💛") }}
        />{" "}
        Duotrigordle?{" "}
        <a target="_blank" href="https://ko-fi.com/thesilican" rel="noreferrer">
          Buy me a{" "}
          <span
            className={emoji}
            dangerouslySetInnerHTML={{ __html: twemoji.parse("☕️") }}
          />{" "}
          !
        </a>
      </div>
      <hr className={seperator} />
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
      <hr className={seperator} />
      <div className={footer}>
        <a
          target="_blank"
          href="https://duotrigordle.com/privacy.html"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
      </div>
    </Modal>
  );
}

function TimeRemaining() {
  const [timeRemaining, setHoursRemaining] = useState(getHoursRemaining);

  useEffect(() => {
    const handle = setInterval(
      () => setHoursRemaining(getHoursRemaining),
      1000
    );
    return () => clearInterval(handle);
  }, []);

  return (
    <p>
      A new Daily Duotrigordle will be available in
      <br />
      {timeRemaining.hr}h&nbsp;{timeRemaining.min}m&nbsp;{timeRemaining.sec}s
    </p>
  );
}

function getHoursRemaining() {
  const diff = Date.now() - START_DATE;
  const hr = Math.floor(24 - ((diff / 1000 / 60 / 60) % 24));
  const min = Math.floor(60 - ((diff / 1000 / 60) % 60));
  const sec = Math.floor(60 - ((diff / 1000) % 60));
  return { hr, min, sec };
}
