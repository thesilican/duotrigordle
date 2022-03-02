import { useEffect } from "react";
import { WORDS_TARGET, WORDS_VALID } from "../store/consts";
import { getGuessResult } from "../store/funcs";

function App() {
  useEffect(() => {
    const randomWords = [];
    for (let i = 0; i < 1000; i++) {
      const a = WORDS_TARGET[Math.floor(Math.random() * WORDS_TARGET.length)];
      const b = WORDS_TARGET[Math.floor(Math.random() * WORDS_TARGET.length)];
      randomWords.push([a, b]);
    }
    console.time();
    for (const [a, b] of randomWords) {
      getGuessResult(a, b);
    }
    console.timeEnd();
  }, []);

  return (
    <div className="App">
      <h1>Hello, world!</h1>
    </div>
  );
}

export default App;
