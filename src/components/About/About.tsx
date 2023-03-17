import { useEffect, useState } from "react";
import {
  START_DATE,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { Modal } from "../common/Modal/Modal";
import { TabButtons } from "../common/TabButtons/TabButtons";
import styles from "./About.module.css";

export function About() {
  const dispatch = useAppDispatch();
  const shown = useAppSelector((s) => s.ui.modal === "about");
  const sideEffects = useAppSelector((s) => s.ui.sideEffects);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (sideEffects[0]?.type === "show-changelog-tab") {
      setTab(1);
      dispatch(uiAction.resolveSideEffect(sideEffects[0].id));
    }
  }, [dispatch, sideEffects]);

  return (
    <Modal shown={shown}>
      <TabButtons
        tabs={["About", "Changelog"]}
        idx={tab}
        onTabChange={setTab}
        size="small"
      />
      {tab === 0 ? <InfoContent /> : <Changelog />}
    </Modal>
  );
}

function InfoContent() {
  const [timeRemaining, setHoursRemaining] = useState(getHoursRemaining);

  useEffect(() => {
    const handle = setInterval(
      () => setHoursRemaining(getHoursRemaining),
      1000
    );
    return () => clearInterval(handle);
  }, []);

  return (
    <>
      <p>Guess all 32 Duotrigordle words in 37 tries!</p>
      <p>
        A new Daily Duotrigordle will be available in
        <br />
        {timeRemaining.hr}h&nbsp;{timeRemaining.min}m&nbsp;{timeRemaining.sec}s
      </p>
      <hr className={styles.seperator} />
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
      <div className={styles.kofi}>
        💛 Duotrigordle?{" "}
        <a target="_blank" href="https://ko-fi.com/thesilican" rel="noreferrer">
          Buy me a ☕️!
        </a>
      </div>
      <hr className={styles.seperator} />
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
      <hr className={styles.seperator} />
      <div className={styles.footer}>
        <a
          target="_blank"
          href="https://duotrigordle.com/privacy.html"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
      </div>
    </>
  );
}

function getHoursRemaining() {
  const diff = Date.now() - START_DATE;
  const hr = Math.floor(24 - ((diff / 1000 / 60 / 60) % 24));
  const min = Math.floor(60 - ((diff / 1000 / 60) % 60));
  const sec = Math.floor(60 - ((diff / 1000) % 60));
  return { hr, min, sec };
}

export function Changelog() {
  return (
    <>
      <p>March 17, 2023</p>
      <ul>
        <li>Added a changelog! So now you know when changes are made</li>
      </ul>
      <p>March 15, 2023</p>
      <ul>
        <li>Make Daily Jumble starting words consistent for everyone</li>
        <li>Added setting to toggle backspace/enter keys</li>
      </ul>
      <p>Feb 28, 2023</p>
      <ul>
        <li>Games are saved seperate for all 3 daily gamemodes</li>
      </ul>
      <p>Feb 27, 2023</p>
      <ul>
        <li>Stats are tracked seperately for all 3 daily gamemodes</li>
      </ul>
      <p>Feb 8, 2023</p>
      <ul>
        <li>Readded setting to hide empty rows</li>
      </ul>
      <p>Feb 6, 2023</p>
      <ul>
        <li>UI Overhaul #3</li>
        <li>
          New game modes! Including Daily Sequence, Daily Jumble, Perfect
          Challenge, and Archive
        </li>
        <li>Added sticky input fields</li>
        <li>Added input hints</li>
        <li>UI overhaul with refreshed colors and layout</li>
        <li>Performance improvements</li>
      </ul>
    </>
  );
}
