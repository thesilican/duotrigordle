import { useAppSelector } from "../../store";
import { Modal } from "../common/Modal/Modal";
import styles from "./Changelog.module.css";

export function Changelog() {
  const shown = useAppSelector((s) => s.ui.modal === "changelog");

  return (
    <Modal shown={shown}>
      <h1 className={styles.title}>Changelog</h1>
      <div className={styles.overflow}>
        <p>
          May 15, 2023 <span className={styles.new}>New!</span>
        </p>
        <ul>
          <li>
            Statistics are now tracked for practice modes (practice
            duotrigordle, sequence, jumble, and perfect challenge)
          </li>
          <li>Removed ability to edit statistics in browser</li>
        </ul>
        <hr />
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
      </div>
    </Modal>
  );
}
