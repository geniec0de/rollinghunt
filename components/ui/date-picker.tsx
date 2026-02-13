type DatePickerProps = {
  id: string;
  name: string;
  label: string;
  /** Earliest selectable date (YYYY-MM-DD). Defaults to today. */
  min?: string;
  /** Pre-filled date (YYYY-MM-DD) when opening the form from calendar. */
  defaultValue?: string;
};

export function DatePicker({ id, name, label, min, defaultValue }: DatePickerProps) {
  const minAttr = min ?? new Date().toISOString().slice(0, 10);
  return (
    <>
      <label className="label" htmlFor={id}>{label}</label>
      <input
        className="input"
        id={id}
        min={minAttr}
        name={name}
        required
        type="date"
        defaultValue={defaultValue}
      />
    </>
  );
}
