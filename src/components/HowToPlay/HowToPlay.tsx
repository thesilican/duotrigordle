import styles from "./HowToPlay.module.css";
import cn from "classnames";
import { useAppSelector } from "../../store";

export function HowToPlay() {
  const colorBlind = useAppSelector((s) => s.settings.colorBlindMode);

  return (
    <div className={cn(styles.main, colorBlind && styles.colorBlind)}>
      <h1 className={styles.big}>Guess all 32 words in 37 tries!</h1>
      <p>
        In Duotrigordle, there are 32 secret words you must guess. Start by
        entering any 5 letter word. Guesses happen for all 32 words
        simultaneously.
      </p>
      <p>
        After guessing a word, the tiles will change color to indicate whether
        your guess is correct. All guesses must be valid English words.
      </p>
      <div className={styles.row}>
        <div className={styles.grid}>
          <div className={styles.cell}>H</div>
          <div className={cn(styles.cell, styles.yellow)}>E</div>
          <div className={styles.cell}>L</div>
          <div className={styles.cell}>L</div>
          <div className={cn(styles.cell, styles.yellow)}>O</div>
          <div className={styles.cell}>W</div>
          <div className={cn(styles.cell, styles.green)}>O</div>
          <div className={styles.cell}>R</div>
          <div className={styles.cell}>L</div>
          <div className={styles.cell}>D</div>
          <div className={styles.cell}>B</div>
          <div className={styles.cell}>A</div>
          <div className={cn(styles.cell, styles.yellow)}>C</div>
          <div className={styles.cell}>O</div>
          <div className={cn(styles.cell, styles.green)}>N</div>
          <div className={cn(styles.cell, styles.input)}></div>
          <div className={cn(styles.cell, styles.input)}>O</div>
          <div className={cn(styles.cell, styles.input)}></div>
          <div className={cn(styles.cell, styles.input)}></div>
          <div className={cn(styles.cell, styles.input)}>N</div>
        </div>
      </div>
      <p>
        A yellow letter indicates that the letter is in the word, but is not in
        the correct position. A green letter indicates that the letter is in the
        correct position in the word. A gray letter indicates that the letter is
        not in the word.
      </p>
      <p>Ghost letters help you visualize the position of green letters.</p>
      <div className={styles.row}>
        <div className={styles.grid}>
          <div className={styles.cell}>H</div>
          <div className={cn(styles.cell, styles.yellow)}>E</div>
          <div className={styles.cell}>L</div>
          <div className={styles.cell}>L</div>
          <div className={cn(styles.cell, styles.yellow)}>O</div>
          <div className={styles.cell}>W</div>
          <div className={cn(styles.cell, styles.green)}>O</div>
          <div className={styles.cell}>R</div>
          <div className={styles.cell}>L</div>
          <div className={styles.cell}>D</div>
          <div className={styles.cell}>B</div>
          <div className={styles.cell}>A</div>
          <div className={cn(styles.cell, styles.yellow)}>C</div>
          <div className={styles.cell}>O</div>
          <div className={cn(styles.cell, styles.green)}>N</div>
          <div className={cn(styles.cell, styles.hint)}>O</div>
          <div className={cn(styles.cell, styles.hint)}>C</div>
          <div className={cn(styles.cell, styles.hint)}>E</div>
          <div className={cn(styles.cell, styles.hint)}>A</div>
          <div className={cn(styles.cell, styles.hint)}>N</div>
        </div>
      </div>
      <p>
        Sometimes when typing a word, the letters will turn yellow, this is a
        hint that your guess cannot be correct. You should check the position of
        all yellow and green letters and try another word.
      </p>
      <p>
        The game is finished when you guess all 32 word, or you run out of
        guesses.
      </p>
      <h1 className={styles.big}>Sequence Mode</h1>
      <p>
        In sequence mode, only one board is visible at a time. Once you solve a
        word, the next board becomes unlocked. To aid in the extra challenge,
        you get 2 extra guesses (39 total).
      </p>
      <h1 className={styles.big}>Jumble Mode</h1>
      <p>
        In jumble mode, the first three words are randomly chosen for you. To
        aid in the extra challenge, you get 1 extra guess (38 total).
      </p>
      <h1 className={styles.big}>Perfect Challenge</h1>
      <p>
        Are you up to the challenge? Guess all 32 words in exactly 32 guesses.
        The first word you type is automatically correct.
      </p>
    </div>
  );
}
