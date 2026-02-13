type DatePickerProps = {
  id: string;
  name: string;
  label: string;
};

export function DatePicker({ id, name, label }: DatePickerProps) {
  return (
    <>
      <label className="label" htmlFor={id}>{label}</label>
      <input className="input" id={id} min={new Date().toISOString().slice(0, 10)} name={name} required type="date" />
    </>
  );
}
