import { useMemo, useState } from "react";
import {
  getAllWordsGuessed,
  NUM_BOARDS,
  NUM_GUESSES,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { formatTimeElapsed, range } from "../../util";
import { Button } from "../common/Button/Button";
import styles from "./Results.module.css";
const { green, red, results, row, share, text, title, word, words } = styles;
import cn from "classnames";

export function Results() {
  const dispatch = useAppDispatch();
  const practice = useAppSelector((s) => s.game.practice);
  const id = useAppSelector((s) => s.game.id);
  const targets = useAppSelector((s) => s.game.targets);
  const guesses = useAppSelector((s) => s.game.guesses);
  const showTimer = useAppSelector((s) => s.settings.showTimer);
  const timeElapsed = useAppSelector((s) => s.game.endTime - s.game.startTime);

  const shareableText = useMemo(() => {
    return getShareableText(
      practice,
      id,
      targets,
      guesses,
      showTimer,
      timeElapsed
    );
  }, [practice, id, targets, guesses, showTimer, timeElapsed]);

  // 0 - Normal
  // 1 - Copied!
  // 2 - Error copying
  const [copied, setCopied] = useState(0);

  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(shareableText)
      .then(() => {
        setCopied(1);
      })
      .catch(() => {
        setCopied(2);
      })
      .finally(() => {
        setTimeout(() => setCopied(0), 3000);
      });
  };

  const handleWordClick = (idx: number) => {
    dispatch(
      uiAction.createSideEffect({
        type: "scroll-board-into-view",
        board: idx,
      })
    );
  };

  const win = getAllWordsGuessed(targets, guesses);

  return (
    <div className={cn(results, win ? green : red)}>
      <p className={title}>{win ? "You win!" : "Better luck next time"}</p>
      <div className={row}>
        <div className={share}>
          <pre className={text}>{shareableText}</pre>
          <Button onClick={handleCopyClick}>
            {copied ? "Copied!" : "Copy to clipboard"}
          </Button>
        </div>
        <div className={words}>
          {range(NUM_BOARDS).map((i) => (
            <button
              key={i}
              className={cn(word, i === 0 && red)}
              onClick={() => handleWordClick(i)}
            >
              {targets[i]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getShareableText(
  practice: boolean,
  id: number,
  targets: string[],
  guesses: string[],
  showTimer: boolean,
  timeElapsed: number
) {
  let text = "";

  // Title
  if (practice) {
    text += `Practice Duotrigordle\n`;
  } else {
    text += `Daily Duotrigordle #${id}\n`;
  }

  // Guesses
  const guessCount = getAllWordsGuessed(targets, guesses)
    ? guesses.length
    : "X";
  text += `Guesses: ${guessCount}/${NUM_GUESSES}\n`;

  // Timer
  if (showTimer) {
    text += `Time: ${formatTimeElapsed(timeElapsed)}\n`;
  }

  // Emojis
  const cols = 4;
  const rows = Math.ceil(NUM_BOARDS / cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const idx = i * cols + j;
      if (idx > NUM_BOARDS) continue;
      if (j !== 0) {
        text += " ";
      }
      const guessIndex = guesses.indexOf(targets[idx]);
      if (guessIndex === -1) {
        text += "🟥🟥";
      } else {
        text += numToEmoji(guessIndex + 1);
      }
    }
    text += "\n";
  }

  // Link
  text += "https://duotrigordle.com/";

  return text;
}

// Converts a 2 digit number to its emoji text form
function numToEmoji(num: number): string {
  if (!Number.isInteger(num) || num < 0 || num > 99) {
    throw new Error("Expected integer from 0-99");
  }
  const EMOJIS = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
  const ones = EMOJIS[num % 10];
  const tens = EMOJIS[Math.floor(num / 10)];
  return tens + ones;
}
