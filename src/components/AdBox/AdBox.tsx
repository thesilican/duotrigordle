import cn from "classnames";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../store";
import styles from "./AdBox.module.css";

// If you're develping Duotrigordle locally and would like to hide ads, set this to true
const overrideHideAds = true;

declare global {
  const ezstandalone: any;
}

export function AdBox() {
  const hideAds = useAppSelector((s) => s.settings.hideAds);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded && !hideAds && !overrideHideAds) {
      setTimeout(() => {
        // Load Ezoic ads
        try {
          // @ts-ignore
          window.ezstandalone = window.ezstandalone || {};
          ezstandalone.cmd = ezstandalone.cmd || [];
          ezstandalone.cmd.push(function () {
            ezstandalone.define(103);
            ezstandalone.enable();
            ezstandalone.display();
          });
        } catch {}
      }, 1000);
      setLoaded(true);
    }
  }, [loaded, hideAds]);

  if (hideAds || overrideHideAds) {
    return null;
  }

  return (
    <div className={cn("ads-box", styles.adBox)}>
      <div id="ezoic-pub-ad-placeholder-103"> </div>
    </div>
  );
}
