import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { resolveSideEffect, useSelector } from "../store";
import cn from "classnames";

export function AdBox() {
  const dispatch = useDispatch();
  const hideAds = useSelector((s) => s.settings.hideAds);
  const sideEffect = useSelector((s) => s.ui.sideEffects[0] ?? null);

  useEffect(() => {
    if (!hideAds && sideEffect && sideEffect.type === "load-ads") {
      try {
        // @ts-ignore
        (adsbygoogle = window.adsbygoogle || []).push({});
      } catch {}
      dispatch(resolveSideEffect(sideEffect.id));
    }
  }, [dispatch, hideAds, sideEffect]);

  return (
    <div className={cn("ad-box-wrapper", hideAds && "hidden")}>
      <div className="ad-box">
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
    </div>
  );
}
