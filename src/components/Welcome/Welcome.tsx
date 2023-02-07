import cn from "classnames";
import { useState } from "react";
import {
  Challenge,
  gameAction,
  getDailyId,
  NUM_GUESSES,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { range } from "../../util";
import { LinkButton } from "../common/LinkButton/LinkButton";
import styles from "./Welcome.module.css";

export function Welcome() {
  const dispatch = useAppDispatch();
  const todaysId = getDailyId(Date.now());
  const [practiceTab, setPracticeTab] = useState(false);
  const [archiveId, setArchiveId] = useState(() => todaysId - 1);
  const [archiveChallenge, setArchiveChallenge] = useState<Challenge>("normal");
  const gameMode = useAppSelector((s) => s.game.gameMode);
  const gameId = useAppSelector((s) => s.game.id);
  const guessCount = useAppSelector((s) => s.game.guesses.length);
  const challenge = useAppSelector((s) => s.game.challenge);
  const showContinue = guessCount > 0 && gameMode === "daily";

  const handleContinueClick = () => {
    dispatch(uiAction.setView("game"));
  };

  const handleNewGameClick = (
    gameMode: "daily" | "practice",
    challenge: Challenge
  ) => {
    dispatch(gameAction.start({ gameMode, challenge, timestamp: Date.now() }));
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

  const renderContinueText = () => {
    let text = "";
    if (challenge === "normal") {
      text += "Daily Duotrigordle";
    } else if (challenge === "sequence") {
      text += "Daily Sequence";
    } else if (challenge === "jumble") {
      text += "Daily Jumble";
    }
    text += ` #${gameId} (${guessCount}/${NUM_GUESSES})`;
    return text;
  };

  function renderDailyTab() {
    if (showContinue) {
      return (
        <div className={styles.gameMode}>
          <LinkButton className={styles.link} onClick={handleContinueClick}>
            Continue
          </LinkButton>
          <p>{renderContinueText()}</p>
        </div>
      );
    } else {
      return (
        <>
          <div className={styles.gameMode}>
            <LinkButton
              className={styles.link}
              onClick={() => handleNewGameClick("daily", "normal")}
            >
              Daily Duotrigordle
            </LinkButton>
            <p>Solve 32 wordles at the same time</p>
          </div>
          <div className={styles.gameMode}>
            <LinkButton
              className={styles.link}
              onClick={() => handleNewGameClick("daily", "sequence")}
            >
              Daily Sequence
            </LinkButton>
            <p>
              The next board is revealed only after solving the current board
            </p>
          </div>
          <div className={styles.gameMode}>
            <LinkButton
              className={styles.link}
              onClick={() => handleNewGameClick("daily", "jumble")}
            >
              Daily Jumble
            </LinkButton>
            <p>
              Tired of using the same starting words? The first 3 words are
              randomly chosen for you
            </p>
          </div>
        </>
      );
    }
  }

  function renderPracticeTab() {
    return (
      <>
        <div className={styles.gameMode}>
          <LinkButton
            className={styles.link}
            onClick={() => handleNewGameClick("practice", "normal")}
          >
            Practice Duotrigordle
          </LinkButton>
          <p>Solve 32 wordles at the same time</p>
        </div>
        <div className={styles.gameMode}>
          <LinkButton
            className={styles.link}
            onClick={() => handleNewGameClick("practice", "sequence")}
          >
            Practice Sequence
          </LinkButton>
          <p>The next board is revealed only after solving the current board</p>
        </div>
        <div className={styles.gameMode}>
          <LinkButton
            className={styles.link}
            onClick={() => handleNewGameClick("practice", "jumble")}
          >
            Practice Jumble
          </LinkButton>
          <p>
            Tired of using the same starting words? The first 3 words are
            randomly chosen for you
          </p>
        </div>
        <div className={styles.gameMode}>
          <LinkButton
            className={styles.link}
            onClick={() => handleNewGameClick("practice", "perfect")}
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

  return (
    <div className={cn(styles.welcome, practiceTab && styles.practice)}>
      <div className={styles.tabs} role="tablist">
        <div className={styles.tabWrapper}>
          <button
            className={styles.tab}
            role="tab"
            onClick={() => setPracticeTab(false)}
          >
            Daily
          </button>
        </div>
        <div className={styles.tabWrapper}>
          <button
            className={styles.tab}
            role="tab"
            onClick={() => setPracticeTab(true)}
          >
            Practice
          </button>
        </div>
        <div className={styles.highlight} />
      </div>
      <div className={styles.tabContainer}>
        {practiceTab ? renderPracticeTab() : renderDailyTab()}
      </div>
    </div>
  );
}
