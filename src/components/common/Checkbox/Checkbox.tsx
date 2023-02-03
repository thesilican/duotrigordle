import cn from "classnames";
import styles from "./Checkbox.module.css";
const { checkbox } = styles;

type CheckboxProps = {
  id?: string;
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
};
export function Checkbox({
  checked,
  onChange,
  className,
  id,
  disabled,
}: CheckboxProps) {
  return (
    <input
      type="checkbox"
      id={id}
      className={cn(className, checkbox)}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  );
}
