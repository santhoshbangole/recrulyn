import { DEPARTMENTS } from "../../modules/org/departments";

type DepartmentSelectProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  required?: boolean;
  id?: string;
};

export function DepartmentSelect({
  value,
  onChange,
  className,
  style,
  required,
  id,
}: DepartmentSelectProps) {
  const extra = value && !DEPARTMENTS.includes(value as (typeof DEPARTMENTS)[number]);

  return (
    <select
      id={id}
      value={value}
      required={required}
      className={className}
      style={style}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select department</option>
      {extra && <option value={value}>{value}</option>}
      {DEPARTMENTS.map((department) => (
        <option key={department} value={department}>
          {department}
        </option>
      ))}
    </select>
  );
}
