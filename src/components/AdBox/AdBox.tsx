import cn from "classnames";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../store";
import styles from "./AdBox.module.css";

// If you're develping Duotrigordle locally and would like to hide ads, set this to true
const overrideHideAds = false;

export function AdBox() {
  const view = useAppSelector((s) => s.ui.view);
  const hideAds = useAppSelector((s) => s.settings.hideAds);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded && !hideAds && !overrideHideAds && view === "game") {
      try {
        // @ts-ignore
        (adsbygoogle = window.adsbygoogle || []).push({});
      } catch {}
      setLoaded(true);
    }
  }, [loaded, view, hideAds]);

  if (hideAds || overrideHideAds || !loaded) {
    return null;
  }

  return (
    <div className={cn(styles.adBox)}>
      <ins
        className="adsbygoogle"
        style={{
          display: "inline-block",
          width: "min(100vw, 600px)",
          height: "60px",
        }}
        data-ad-client="ca-pub-4459769759726497"
        data-ad-slot="5019524864"
      />
    </div>
  );
}
