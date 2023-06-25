import cn from "classnames";
import { useEffect, useState } from "react";
import {
  Challenge,
  DailyChallenge,
  getCompletedBoardsCount,
  getDailyId,
  getTargetWords,
  NUM_BOARDS,
  storageAction,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { unreachable } from "../../util";
import { LinkButton } from "../common/LinkButton/LinkButton";
import { TabButtons } from "../common/TabButtons/TabButtons";
import styles from "./Welcome.module.css";

export function Welcome() {
  const dispatch = useAppDispatch();
  const tabIdx = useAppSelector((s) => s.ui.welcomeTab);

  return (
    <div
      className={cn(
        styles.welcome,
        tabIdx === 0 && styles.daily,
        tabIdx === 1 && styles.practice,
        tabIdx === 2 && styles.more
      )}
    >
      <TabButtons
        tabs={["Daily", "Practice", "More"]}
        idx={tabIdx}
        onTabChange={(idx) => dispatch(uiAction.setWelcomeTab(idx))}
      />
      <div className={styles.tabContainer}>
        {tabIdx === 0 ? (
          <DailyTab />
        ) : tabIdx === 1 ? (
          <PracticeTab />
        ) : tabIdx === 2 ? (
          <MoreTab />
        ) : (
          unreachable()
        )}
      </div>
    </div>
  );
}

function DailyTab() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(storageAction.pruneSaves({ timestamp: Date.now() }));
  }, [dispatch]);

  return (
    <>
      <DailyLink
        title="Daily Duotrigordle"
        description="Solve 32 wordles at the same time"
        challenge="normal"
      />
      <DailyLink
        title="Daily Sequence"
        description="The next board is revealed only after solving the current board"
        challenge="sequence"
      />
      <DailyLink
        title="Daily Jumble"
        description="Tired of using the same starting words? The first 3 words are randomly chosen for you"
        challenge="jumble"
      />
    </>
  );
}

type DailyLinkProps = {
  title: string;
  description: string;
  challenge: DailyChallenge;
};
function DailyLink(props: DailyLinkProps) {
  const dispatch = useAppDispatch();
  const gameSave = useAppSelector((s) => s.storage.daily)[props.challenge];

  const handleClick = () => {
    dispatch(
      uiAction.navigate({
        to: {
          view: "game",
          gameMode: "daily",
          challenge: props.challenge,
        },
        timestamp: Date.now(),
      })
    );
  };

  if (!gameSave) {
    return (
      <div className={styles.item}>
        <LinkButton className={styles.link} onClick={handleClick}>
          {props.title}
        </LinkButton>
        <p>{props.description}</p>
      </div>
    );
  }

  const targets = getTargetWords(gameSave.id, props.challenge);
  const guesses = gameSave.guesses;
  const boardsComplete = getCompletedBoardsCount(targets, guesses);
  const gameOver = gameSave.endTime !== null;

  return (
    <div className={styles.item}>
      <LinkButton className={styles.link} onClick={handleClick}>
        {gameOver ? "View Results" : "Continue"}
      </LinkButton>
      <p>
        {props.title} #{gameSave.id} ({boardsComplete}/{NUM_BOARDS})
      </p>
    </div>
  );
}

function PracticeTab() {
  const dispatch = useAppDispatch();
  const todaysId = getDailyId(Date.now());
  const [archiveId, setArchiveId] = useState(() => todaysId - 1);
  const [archiveChallenge, setArchiveChallenge] =
    useState<DailyChallenge>("normal");

  const handleNewPracticeGameClick = (challenge: Challenge) => {
    dispatch(
      uiAction.navigate({
        to: {
          view: "game",
          gameMode: "practice",
          challenge,
        },
        timestamp: Date.now(),
      })
    );
  };

  const handleNewArchiveClick = () => {
    dispatch(
      uiAction.navigate({
        to: {
          view: "game",
          gameMode: "historic",
          challenge: archiveChallenge,
          id: archiveId,
        },
        timestamp: Date.now(),
      })
    );
  };

  return (
    <>
      <div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("normal")}
        >
          Practice Duotrigordle
        </LinkButton>
        <p>Solve 32 wordles at the same time</p>
      </div>
      <div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("sequence")}
        >
          Practice Sequence
        </LinkButton>
        <p>The next board is revealed only after solving the current board</p>
      </div>
      <div className={styles.item}>
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
      <div className={styles.item}>
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
      <div className={styles.item}>
        <LinkButton className={styles.link} onClick={handleNewArchiveClick}>
          Historic
        </LinkButton>
        <p className={styles.historicDescription}>
          <span>Play historic</span>
          <select
            className={styles.historicSelect}
            value={archiveChallenge}
            onChange={(e) => setArchiveChallenge(e.target.value as "normal")}
          >
            <option value="normal">duotrigordle</option>
            <option value="sequence">sequence</option>
            <option value="jumble">jumble</option>
          </select>
          <input
            size={3}
            className={styles.historicInput}
            type="number"
            min={0}
            max={todaysId - 1}
            value={archiveId}
            onChange={(e) => setArchiveId(parseInt(e.target.value, 10))}
          />
        </p>
      </div>
    </>
  );
}

function MoreTab() {
  const dispatch = useAppDispatch();
  const kofiEmail = useAppSelector((s) => s.settings.kofiEmail);

  return (
    <>
      <div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() =>
            dispatch(
              uiAction.navigate({
                to: { view: "stats" },
                timestamp: Date.now(),
              })
            )
          }
        >
          Stats
        </LinkButton>
        <p>View your daily and practice duotrigordle stats</p>
      </div>
      <div className={styles.item}>
        <a
          className={styles.link}
          target="_blank"
          href="https://ko-fi.com/thesilican"
          rel="noreferrer"
        >
          Buy me a ☕️
        </a>
        {kofiEmail ? (
          <p>Thank you for supporting ♥️</p>
        ) : (
          <p>Love duotrigordle? Show your support!</p>
        )}
      </div>
      <div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() =>
            dispatch(
              uiAction.navigate({
                to: { view: "how-to-play" },
                timestamp: Date.now(),
              })
            )
          }
        >
          How to play
        </LinkButton>
      </div>
      <div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() => dispatch(uiAction.showModal("changelog"))}
        >
          Changelog
        </LinkButton>
      </div>
      <div className={styles.item}>
        <LinkButton
          className={styles.link}
          onClick={() =>
            dispatch(
              uiAction.navigate({
                to: { view: "privacy-policy" },
                timestamp: Date.now(),
              })
            )
          }
        >
          Privacy Policy
        </LinkButton>
      </div>
    </>
  );
}
