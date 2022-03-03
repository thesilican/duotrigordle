import cn from "classnames";

type PopupProps = {
  shown: boolean;
  onClose: () => void;
};
export default function Popup(props: PopupProps) {
  return (
    <div className={cn("popup-wrapper", !props.shown && "hidden")}>
      <div className="popup">
        <p>Duotrigordle by Bryan Chen</p>
        <p>
          Source code on{" "}
          <a target="_blank" href="https://github.com/thesilican/duotrigordle">
            GitHub
          </a>
        </p>
        <p>Based on</p>
        <ul>
          <li>
            <a target="_blank" href="https://hexadecordle.co.uk/">
              Hexadecordle
            </a>{" "}
            by Alfie Rayner
          </li>
          <li>
            <a target="_blank" href="https://octordle.com/">
              Octordle
            </a>{" "}
            by Kenneth Crawford
          </li>
          <li>
            <a target="_blank" href="https://quordle.com/">
              Quordle
            </a>{" "}
            by @fireph
          </li>
          <li>
            <a target="_blank" href="https://zaratustra.itch.io/dordle">
              Dordle
            </a>{" "}
            by Guilherme S. Töws
          </li>
          <li>
            <a
              target="_blank"
              href="https://www.nytimes.com/games/wordle/index.html"
            >
              Wordle
            </a>{" "}
            by Josh Wardle
          </li>
        </ul>
        <button className="close" onClick={props.onClose}>
          close
        </button>
      </div>
    </div>
  );
}
