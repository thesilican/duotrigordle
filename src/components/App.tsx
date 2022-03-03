import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { startGame } from "../store";
import Boards from "./Boards";
import Header from "./Header";
import Keyboard from "./Keyboard";
import Popup from "./Popup";

export default function App() {
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    dispatch(startGame({ id: 1 }));
  }, [dispatch]);

  return (
    <>
      <div className="game">
        <Header onShowHelp={() => setShowPopup(true)} />
        <Boards />
        <Keyboard hidden={false} />
      </div>
      <Popup shown={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
}
