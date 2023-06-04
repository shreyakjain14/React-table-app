import { useState } from "react";

export default function Input({
  info: {
    getValue,
    row: { index },
    column: { id },
    table,
  },
}: any) {
  const [value, setValue] = useState(() => getValue());
  const changePrice = (e: any) => {
    setValue(e.target.value);
    table.options.meta?.updateData(index, id, e.target.value);
  };

  return (
    <input
      className="border-[1px] p-2 m-2 border-grey-100"
      type="number"
      min="0"
      value={value}
      step={0.1}
      onChange={changePrice}
    />
  );
}
