import cn from "classnames";
import { useEffect, useState } from "react";
import aboutIcon from "../../assets/about.svg";
import backIcon from "../../assets/back.svg";
import fullscreenExitIcon from "../../assets/fullscreen-exit.svg";
import fullscreenIcon from "../../assets/fullscreen.svg";
import statsIcon from "../../assets/stats.svg";
import settingsIcon from "../../assets/settings.svg";
import { AdBox } from "../AdBox/AdBox";
import { Button } from "../common/Button/Button";
import {
  back,
  timer,
  header,
  icon,
  img,
  row1,
  row2,
  title,
  titleWrapper,
  welcome,
} from "./Header.module.css";

export function Header() {
  const [isWelcome, setIsWelcome] = useState(true);
  return (
    <div className={cn(isWelcome && welcome, header)}>
      <AdBox />
      <Row1 onClick={() => setIsWelcome((x) => !x)} />
      <Row2 />
    </div>
  );
}

function Row1({ onClick }: { onClick: () => void }) {
  const { fullscreen, toggleFullscreen } = useFullscreen();
  return (
    <div className={row1}>
      <Button className={cn(icon, back)}>
        <img className={img} src={backIcon} alt="back" />
      </Button>
      <div className={titleWrapper}>
        <p className={title}>Duotrigordle</p>
      </div>
      <Button className={icon} onClick={onClick}>
        <img className={img} src={statsIcon} alt="stats" />
      </Button>
      <Button className={icon}>
        <img className={img} src={aboutIcon} alt="about" />
      </Button>
      <Button className={icon}>
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

  return { fullscreen, toggleFullscreen };
}
