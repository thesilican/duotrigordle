import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAdsLoadState, useSelector } from "../store";

export function AdBox() {
  const dispatch = useDispatch();
  const adsLoaded = useSelector((s) => s.ui.adsLoaded);

  useEffect(() => {
    if (!adsLoaded) {
      dispatch(setAdsLoadState(true));
      try {
        console.log("Loading ad");
        // @ts-ignore
        (adsbygoogle = window.adsbygoogle || []).push({});
      } catch {}
    }
  }, [dispatch, adsLoaded]);

  return (
    <div className="ad-box-wrapper">
      <div className="ad-box">
        <ins
          className="adsbygoogle"
          style={{ display: "inline-block", width: "600px", height: "60px" }}
          data-ad-client="ca-pub-4459769759726497"
          data-ad-slot="5019524864"
        />
      </div>
    </div>
  );
}
