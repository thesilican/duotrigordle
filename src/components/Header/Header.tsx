import cn from "classnames";
import { useEffect, useState } from "react";
import aboutIcon from "../../assets/about.svg";
import backIcon from "../../assets/back.svg";
import fullscreenExitIcon from "../../assets/fullscreen-exit.svg";
import fullscreenIcon from "../../assets/fullscreen.svg";
import restartIcon from "../../assets/restart.svg";
import settingsIcon from "../../assets/settings.svg";
import statsIcon from "../../assets/stats.svg";
import { uiAction, useAppDispatch, useAppSelector } from "../../store";
import { AdBox } from "../AdBox/AdBox";
import { Button } from "../common/Button/Button";
import {
  header,
  hidden,
  icon,
  img,
  row1,
  row2,
  timer,
  title,
  titleWrapper,
  welcome,
} from "./Header.module.css";

export function Header() {
  const isWelcomeView = useAppSelector((s) => s.ui.view === "welcome");

  return (
    <div className={cn(isWelcomeView && welcome, header)}>
      <AdBox />
      <Row1 />
      <Row2 />
    </div>
  );
}

function Row1() {
  const dispatch = useAppDispatch();
  const { fullscreen, toggleFullscreen } = useFullscreen();
  const isWelcomeView = useAppSelector((s) => s.ui.view === "welcome");

  const titleText = isWelcomeView ? "Duotrigordle" : "Practice Duotrigordle";

  return (
    <div className={row1}>
      <Button
        className={cn(icon, isWelcomeView && hidden)}
        onClick={() => dispatch(uiAction.setView("welcome"))}
      >
        <img className={img} src={backIcon} alt="back" />
      </Button>
      <Button className={cn(icon, hidden)}>
        <img className={img} src={restartIcon} alt="restart" />
      </Button>
      <div className={titleWrapper}>
        <p className={title}>{titleText}</p>
      </div>
      <Button
        className={icon}
        onClick={() => dispatch(uiAction.showModal("stats"))}
      >
        <img className={img} src={statsIcon} alt="stats" />
      </Button>
      <Button
        className={icon}
        onClick={() => dispatch(uiAction.showModal("about"))}
      >
        <img className={img} src={aboutIcon} alt="about" />
      </Button>
      <Button
        className={icon}
        onClick={() => dispatch(uiAction.showModal("settings"))}
      >
        <img className={img} src={settingsIcon} alt="settings" />
      </Button>
      <Button className={icon} onClick={toggleFullscreen}>
        <img
          className={img}
          src={fullscreen ? fullscreenExitIcon : fullscreenIcon}
          alt="toggle fullscreen"
        />
      </Button>
    </div>
  );
}

function Row2() {
  return (
    <div className={row2}>
      <span>Boards: 32/32</span>
      <Timer />
      <span>Guesses: 37/37 (+5)</span>
    </div>
  );
}

function Timer() {
  return <span className={cn(timer)}>{false ? "00:00.00" : ""}</span>;
}

// Type declarations for fullscreen stuff
declare global {
  interface Document {
    webkitFullscreenElement: Element | null;
    webkitExitFullscreen: () => void;
  }
  interface HTMLElement {
    webkitRequestFullscreen: () => void;
  }
}

function useFullscreen() {
  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }
  function enterFullscreen() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
  }
  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
  function toggleFullscreen() {
    if (fullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }

  const [fullscreen, setFullscreen] = useState(isFullscreen);
  useEffect(() => {
    const handler = () => setFullscreen(isFullscreen);
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  return { fullscreen, enterFullscreen, exitFullscreen, toggleFullscreen };
}
