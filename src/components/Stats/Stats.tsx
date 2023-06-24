import { ResponsiveBar } from "@nivo/bar";
import styles from "./Stats.module.css";

const data = [
  {
    guesses: 32,
    value: 4,
  },
  {
    guesses: 33,
    value: 3,
  },
  {
    guesses: 34,
    value: 0,
  },
  {
    guesses: 35,
    value: 1,
  },
  {
    guesses: 36,
    value: 4,
  },
];
const theme = {
  background: "transparent",
  text: {
    fontSize: 11,
    fill: "white",
    outlineWidth: 0,
    outlineColor: "transparent",
  },
  axis: {
    domain: {
      line: {
        stroke: "white",
        strokeWidth: 1,
      },
    },
    legend: {
      text: {
        fontSize: 12,
        fill: "white",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
    ticks: {
      line: {
        stroke: "white",
        strokeWidth: 1,
      },
      text: {
        fontSize: 11,
        fill: "white",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
  },
  grid: {
    line: {
      stroke: "#dddddd",
      strokeWidth: 1,
    },
  },
  legends: {
    title: {
      text: {
        fontSize: 11,
        fill: "white",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
    text: {
      fontSize: 11,
      fill: "white",
      outlineWidth: 0,
      outlineColor: "transparent",
    },
    ticks: {
      line: {},
      text: {
        fontSize: 10,
        fill: "#333333",
        outlineWidth: 0,
        outlineColor: "transparent",
      },
    },
  },
  annotations: {
    text: {
      fontSize: 13,
      fill: "#333333",
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    link: {
      stroke: "#000000",
      strokeWidth: 1,
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    outline: {
      stroke: "#000000",
      strokeWidth: 2,
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    symbol: {
      fill: "#000000",
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
  },
  tooltip: {
    container: {
      background: "#ffffff",
      color: "black",
      fontSize: 12,
    },
    basic: {},
    chip: {},
    table: {},
    tableCell: {},
    tableCellValue: {},
  },
};

export default function Stats() {
  return (
    <div className={styles.stats}>
      <p>Hi</p>
      <div className={styles.graphContainer}>
        <ResponsiveBar
          data={data}
          keys={["value"]}
          indexBy="guesses"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.5}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "nivo" }}
          borderColor="#000000"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
          }}
          axisLeft={{
            tickSize: 5,
            tickRotation: 0,
          }}
          layout="horizontal"
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: "color",
            modifiers: [["darker", 1.6]],
          }}
          enableGridX={false}
          enableGridY={false}
          theme={theme}
        />
      </div>
    </div>
  );
}
