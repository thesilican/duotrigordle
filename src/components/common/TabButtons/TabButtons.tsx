import styles from "./TabButtons.module.css";
import cn from "classnames";

export type TabButtonsProps = {
  tabs: React.ReactNode[];
  idx?: number;
  onTabChange?: (idx: number) => void;
  size?: "normal" | "small" | "tiny";
};

export function TabButtons(props: TabButtonsProps) {
  return (
    <div
      className={cn(
        styles.tabs,
        props.size === "small" && styles.small,
        props.size === "tiny" && styles.tiny
      )}
      style={{ gridTemplateColumns: `repeat(${props.tabs.length}, 1fr)` }}
      role="tablist"
    >
      {props.tabs.map((label, idx) => (
        <div key={idx} className={styles.tabWrapper}>
          <button
            className={styles.tab}
            role="tab"
            onClick={() => props.onTabChange?.(idx)}
          >
            {label}
          </button>
        </div>
      ))}
      <div
        className={styles.highlight}
        style={{
          width: `${100 / props.tabs.length}%`,
          transform: `translateX(${(props.idx ?? 0) * 100}%)`,
        }}
      />
    </div>
  );
}
