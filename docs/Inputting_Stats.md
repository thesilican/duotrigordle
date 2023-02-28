# Inputting Statistics

Since Duotrigordle added statistics quite late, I've included the ability for you to manually input past games
in case you've been tracking them on your own.

![Stats](https://i.imgur.com/jgFVAVy.png)

## Editing Stats

To edit your duotrigordle statistics, click "Edit" at the bottom of the statistics dialog.

Each line of text represents one game of duotrigordle, and contains the following pieces of data seperated by spaces:

1. Daily Duotrigordle Number
2. Challenge mode, "N" for normal mode, "S" for sequence mode, "J" for jumble mode
3. Guess Count, this should be a number from 32-37 representing the number of guesses it took, or "X" if you failed to guess every word
4. Time Elapsed, this is how long it took you to complete the game, or you can enter "-" if you do not want to track the time for that game (it will not be counted towards your time averages). Some examples of valid time formats are: `1:23.45`, `83.45`, `01:00`, `123:00`

Below is an example of valid entries:

```
102 N 36 -
105 N 37 -
300 J 35 12:34.23
302 S 37 01:32.23
303 N 36 01:32.12
304 S X 06:03.00
310 J 36 12:03.00
```

Click "Submit" once you've finished making any changes to your stats, or "Reset" to undo any changes you've made.
