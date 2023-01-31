import cn from "classnames";
import { useState } from "react";
import { uiAction, useAppDispatch } from "../../store";
import { LinkButton } from "../common/LinkButton/LinkButton";
import {
  gamemode,
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
  const [isPractice, setIsPractice] = useState(false);

  return (
    <div className={cn(welcome, isPractice && practice)}>
      <div className={tabs} role="tablist">
        <div className={tabWrapper}>
          <button
            className={tab}
            role="tab"
            onClick={() => setIsPractice(false)}
          >
            Daily
          </button>
        </div>
        <div className={tabWrapper}>
          <button
            className={tab}
            role="tab"
            onClick={() => setIsPractice(true)}
          >
            Practice
          </button>
        </div>
        <div className={highlight} />
      </div>
      <div className={gmDaily}>
        <div className={gamemode}>
          <LinkButton
            className={link}
            onClick={() => dispatch(uiAction.setView("game"))}
          >
            Continue
          </LinkButton>
          <p>Continue your current game.</p>
        </div>
        <div className={gamemode}>
          <LinkButton className={link}>Daily Duotrigordle</LinkButton>
          <p>Solve 32 wordles at the same time</p>
        </div>
        <div className={gamemode}>
          <LinkButton className={link}>Daily Sequence</LinkButton>
          <p>The next board is revealed only after solving the current board</p>
        </div>
        <div className={gamemode}>
          <LinkButton className={link}>Daily Jumble</LinkButton>
          <p>
            Tired of using the same starting words? The first 3 words are
            randomly chosen for you
          </p>
        </div>
      </div>
      <div className={gmPractice}>
        <div className={gamemode}>
          <LinkButton className={link}>Continue</LinkButton>
          <p>Insert information here</p>
        </div>
        <div className={gamemode}>
          <LinkButton className={link}>Practice Duotrigordle</LinkButton>
          <p>Solve 32 wordles at the same time</p>
        </div>
        <div className={gamemode}>
          <LinkButton className={link}>Practice Sequence</LinkButton>
          <p>The next board is revealed only after solving the current board</p>
        </div>
        <div className={gamemode}>
          <LinkButton className={link}>Practice Jumble</LinkButton>
          <p>
            Tired of using the same starting words? The first 3 words are
            randomly chosen for you
          </p>
        </div>
        <div className={gamemode}>
          <LinkButton className={link}>Archive</LinkButton>
          <p>Play any past daily duotrigordle!</p>
        </div>
      </div>
    </div>
  );
}
