import cn from "classnames";
import { useMemo, useState } from "react";
import {
  Challenge,
  gameAction,
  getCompletedBoardsCount,
  getDailyId,
  NUM_BOARDS,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { range } from "../../util";
import { LinkButton } from "../common/LinkButton/LinkButton";
import { TabButtons } from "../common/TabButtons/TabButtons";
import styles from "./Welcome.module.css";

export function Welcome() {
  const [tabIdx, setTabIdx] = useState(0);

  return (
    <div className={cn(styles.welcome, tabIdx === 1 && styles.practice)}>
      <TabButtons
        tabs={["Daily", "Practice"]}
        idx={tabIdx}
        onTabChange={setTabIdx}
      />
      <div className={styles.tabContainer}>
        {tabIdx === 0 ? <DailyTab /> : <PracticeTab />}
      </div>
    </div>
  );
}

function DailyTab() {
  const dispatch = useAppDispatch();
  const gameMode = useAppSelector((s) => s.game.gameMode);
  const gameId = useAppSelector((s) => s.game.id);
  const guessCount = useAppSelector((s) => s.game.guesses.length);
  const challenge = useAppSelector((s) => s.game.challenge);
  const targets = useAppSelector((s) => s.game.targets);
  const guesses = useAppSelector((s) => s.game.guesses);
  const boardsComplete = useMemo(
    () => getCompletedBoardsCount(targets, guesses),
    [guesses, targets]
  );
  const showContinue = guessCount > 0 && gameMode === "daily";

  const handleContinueClick = () => {
    dispatch(uiAction.setView("game"));
  };

  const handleNewGameClick = (challenge: Challenge) => {
    dispatch(
      gameAction.start({ gameMode: "daily", challenge, timestamp: Date.now() })
    );
    dispatch(uiAction.setView("game"));
  };

  if (showContinue) {
    let text = "";
    if (challenge === "normal") {
      text += "Daily Duotrigordle";
    } else if (challenge === "sequence") {
      text += "Daily Sequence";
    } else if (challenge === "jumble") {
      text += "Daily Jumble";
    }
    text += ` #${gameId} (${boardsComplete}/${NUM_BOARDS})`;
    return (
      <div className={styles.gameMode}>
        <LinkButton className={styles.link} onClick={handleContinueClick}>
          Continue
        </LinkButton>
        <p>{text}</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.gameMode}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewGameClick("normal")}
        >
          Daily Duotrigordle
        </LinkButton>
        <p>Solve 32 wordles at the same time</p>
      </div>
      <div className={styles.gameMode}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewGameClick("sequence")}
        >
          Daily Sequence
        </LinkButton>
        <p>The next board is revealed only after solving the current board</p>
      </div>
      <div className={styles.gameMode}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewGameClick("jumble")}
        >
          Daily Jumble
        </LinkButton>
        <p>
          Tired of using the same starting words? The first 3 words are randomly
          chosen for you
        </p>
      </div>
    </>
  );
}

function PracticeTab() {
  const dispatch = useAppDispatch();
  const todaysId = getDailyId(Date.now());
  const [archiveId, setArchiveId] = useState(() => todaysId - 1);
  const [archiveChallenge, setArchiveChallenge] = useState<Challenge>("normal");

  const handleNewPracticeGameClick = (challenge: Challenge) => {
    dispatch(
      gameAction.start({
        gameMode: "practice",
        challenge,
        timestamp: Date.now(),
      })
    );
    dispatch(uiAction.setView("game"));
  };

  const handleNewArchiveClick = () => {
    dispatch(
      gameAction.start({
        gameMode: "historic",
        challenge: archiveChallenge,
        timestamp: Date.now(),
        id: archiveId,
      })
    );
    dispatch(uiAction.setView("game"));
  };

  return (
    <>
      <div className={styles.gameMode}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("normal")}
        >
          Practice Duotrigordle
        </LinkButton>
        <p>Solve 32 wordles at the same time</p>
      </div>
      <div className={styles.gameMode}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("sequence")}
        >
          Practice Sequence
        </LinkButton>
        <p>The next board is revealed only after solving the current board</p>
      </div>
      <div className={styles.gameMode}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("jumble")}
        >
          Practice Jumble
        </LinkButton>
        <p>
          Tired of using the same starting words? The first 3 words are randomly
          chosen for you
        </p>
      </div>
      <div className={styles.gameMode}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("perfect")}
        >
          Perfect Challenge
        </LinkButton>
        <p>
          The ultimate duotrigordle challenge! Can you complete 32 boards
          without making a single mistake?
        </p>
      </div>
      <div className={styles.gameMode}>
        <LinkButton className={styles.link} onClick={handleNewArchiveClick}>
          Archive
        </LinkButton>
        <p className={styles.archiveDescription}>
          <span>Play historic </span>
          <select
            className={styles.archiveSelect}
            value={archiveChallenge}
            onChange={(e) => setArchiveChallenge(e.target.value as "normal")}
          >
            <option value="normal">duotrigordle</option>
            <option value="sequence">sequence</option>
            <option value="jumble">jumble</option>
          </select>
          <select
            className={styles.archiveSelect}
            value={archiveId}
            onChange={(e) => setArchiveId(parseInt(e.target.value, 10))}
          >
            {range(1, todaysId).map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </p>
      </div>
    </>
  );
}
