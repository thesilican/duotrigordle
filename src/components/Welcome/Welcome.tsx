import cn from "classnames";
import { useState } from "react";
import {
  gameAction,
  GameMode,
  getTodaysId,
  NUM_GUESSES,
  PRACTICE_MODE_MIN_ID,
  uiAction,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { MersenneTwister, range } from "../../util";
import { LinkButton } from "../common/LinkButton/LinkButton";
import {
  archiveDescription,
  gmDaily,
  gmPractice,
  highlight,
  link,
  practice,
  tab,
  tabs,
  tabWrapper,
  welcome,
} from "./Welcome.module.css";

export function Welcome() {
  const dispatch = useAppDispatch();
  const [practiceTab, setPracticeTab] = useState(false);
  const [archiveId, setArchiveId] = useState(() => getTodaysId() - 1);
  const isPractice = useAppSelector((s) => s.game.practice);
  const gameId = useAppSelector((s) => s.game.id);
  const guessCount = useAppSelector((s) => s.game.guesses.length);
  const gameMode = useAppSelector((s) => s.game.gameMode);
  const showContinue = guessCount > 0 && !isPractice;

  const renderContinueText = () => {
    let text = "";
    if (gameMode === "normal") {
      text += "Daily Duotrigordle";
    } else if (gameMode === "sequence") {
      text += "Daily Sequence";
    } else if (gameMode === "jumble") {
      text += "Daily Jumble";
    }
    text += ` #${gameId} (${guessCount}/${NUM_GUESSES})`;
    return text;
  };

  const handleContinueClick = () => {
    dispatch(uiAction.setView("game"));
  };

  const handleNewGameClick = (practice: boolean, gameMode: GameMode) => {
    let id;
    if (practice) {
      const rng = MersenneTwister(Date.now());
      do {
        id = rng.u32();
      } while (id < PRACTICE_MODE_MIN_ID);
    } else {
      id = getTodaysId();
    }
    dispatch(
      gameAction.start({
        id,
        practice,
        gameMode,
        timestamp: Date.now(),
      })
    );
    dispatch(uiAction.setView("game"));
  };

  const handleArchiveClick = () => {
    dispatch(
      gameAction.start({
        id: archiveId,
        practice: true,
        gameMode: "normal",
        timestamp: Date.now(),
      })
    );
    dispatch(uiAction.setView("game"));
  };

  return (
    <div className={cn(welcome, practiceTab && practice)}>
      <div className={tabs} role="tablist">
        <div className={tabWrapper}>
          <button
            className={tab}
            role="tab"
            onClick={() => setPracticeTab(false)}
          >
            Daily
          </button>
        </div>
        <div className={tabWrapper}>
          <button
            className={tab}
            role="tab"
            onClick={() => setPracticeTab(true)}
          >
            Practice
          </button>
        </div>
        <div className={highlight} />
      </div>
      <div className={gmDaily}>
        {showContinue ? (
          <div className={gameMode}>
            <LinkButton className={link} onClick={handleContinueClick}>
              Continue
            </LinkButton>
            <p>{renderContinueText()}</p>
          </div>
        ) : (
          <>
            <div className={gameMode}>
              <LinkButton
                className={link}
                onClick={() => handleNewGameClick(false, "normal")}
              >
                Daily Duotrigordle
              </LinkButton>
              <p>Solve 32 wordles at the same time</p>
            </div>
            <div className={gameMode}>
              <LinkButton
                className={link}
                onClick={() => handleNewGameClick(false, "sequence")}
              >
                Daily Sequence
              </LinkButton>
              <p>
                The next board is revealed only after solving the current board
              </p>
            </div>
            <div className={gameMode}>
              <LinkButton
                className={link}
                onClick={() => handleNewGameClick(false, "jumble")}
              >
                Daily Jumble
              </LinkButton>
              <p>
                Tired of using the same starting words? The first 3 words are
                randomly chosen for you
              </p>
            </div>
          </>
        )}
      </div>
      <div className={gmPractice}>
        <div className={gameMode}>
          <LinkButton
            className={link}
            onClick={() => handleNewGameClick(true, "normal")}
          >
            Practice Duotrigordle
          </LinkButton>
          <p>Solve 32 wordles at the same time</p>
        </div>
        <div className={gameMode}>
          <LinkButton
            className={link}
            onClick={() => handleNewGameClick(true, "sequence")}
          >
            Practice Sequence
          </LinkButton>
          <p>The next board is revealed only after solving the current board</p>
        </div>
        <div className={gameMode}>
          <LinkButton
            className={link}
            onClick={() => handleNewGameClick(true, "jumble")}
          >
            Practice Jumble
          </LinkButton>
          <p>
            Tired of using the same starting words? The first 3 words are
            randomly chosen for you
          </p>
        </div>
        <div className={gameMode}>
          <LinkButton className={link} onClick={handleArchiveClick}>
            Archive
          </LinkButton>
          <p className={archiveDescription}>
            <span>Play historic duotrigordle </span>
            <select
              value={archiveId}
              onChange={(e) => setArchiveId(parseInt(e.target.value, 10))}
            >
              {range(1, getTodaysId()).map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </p>
        </div>
      </div>
    </div>
  );
}
