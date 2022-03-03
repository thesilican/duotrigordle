import cn from "classnames";
import { useMemo } from "react";
import twemoji from "twemoji";
import { allWordsGuessed, NUM_GUESSES, useSelector } from "../store";

type ResultProps = {
  hidden: boolean;
};
export default function Result(props: ResultProps) {
  const id = useSelector((s) => s.id);

  const targets = useSelector((s) => s.targets);
  const guesses = useSelector((s) => s.guesses);

  const shareableText = useMemo(() => {
    const targetGuessCounts: (number | null)[] = [];
    for (const target of targets) {
      const idx = guesses.indexOf(target);
      targetGuessCounts.push(idx === -1 ? null : idx);
    }
    const guessCount = allWordsGuessed(guesses, targets)
      ? guesses.length
      : null;
    return getShareableText(id, guessCount, targetGuessCounts);
  }, [targets, guesses]);
  const parsed = twemoji.parse(shareableText) + "\n";
  const handleCopyToClipboardClick = () => {
    navigator.clipboard
      .writeText(shareableText)
      .then(() => alert("Copied results to clipboard!"))
      .catch(() => alert("There was an error copying text to the clipboard"));
  };

  return (
    <div className={cn("result", props.hidden && "hidden")}>
      <div className="share">
        <pre className="text" dangerouslySetInnerHTML={{ __html: parsed }} />
        <button onClick={handleCopyToClipboardClick}>copy to clipboard</button>
      </div>
      <div className="words">
        {targets.map((target, i) => (
          <p key={i}>{target}</p>
        ))}
      </div>
    </div>
  );
}

const EMOJI_MAP = [
  "0️⃣",
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
  "🔟",
  "🇦",
  "🇧",
  "🇨",
  "🇩",
  "🇪",
  "🇫",
  "🇬",
  "🇭",
  "🇮",
  "🇯",
  "🇰",
  "🇱",
  "🇲",
  "🇳",
  "🇴",
  "🇵",
  "🇶",
  "🇷",
  "🇸",
  "🇹",
  "🇺",
  "🇻",
  "🇼",
  "🇽",
  "🇾",
  "🇿",
  "🅰️",
  "🅱️",
  "🆎",
  "🅾️",
];

function getShareableText(
  id: number,
  guessCount: number | null,
  targetGuessCounts: (number | null)[]
) {
  const text = [];
  text.push(`Daily Duotrigordle #${id}\n`);
  text.push(`Guesses: ${guessCount ?? "X"}/${NUM_GUESSES}\n`);
  for (let i = 0; i < 8; i++) {
    const row = [];
    for (let j = 0; j < 4; j++) {
      const guessCount = targetGuessCounts[i * 4 + j];
      if (guessCount === null) {
        row.push("🟥");
      } else {
        row.push(EMOJI_MAP.at(guessCount));
      }
    }

    text.push(row.join(" ") + "\n");
  }
  return text.join("");
}
