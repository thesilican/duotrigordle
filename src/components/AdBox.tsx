import { useEffect } from "react";

export function AdBox() {
  useEffect(() => {
    // @ts-ignore
    (adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <div className="ad-box">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4459769759726497"
        data-ad-slot="5019524864"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
