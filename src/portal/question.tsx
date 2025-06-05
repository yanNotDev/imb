import { type ChangeEvent } from "react";
import { CheckCircleIcon } from "@heroicons/react/solid";

interface Props {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder: string;
  disabled?: boolean;
}

const Question: React.FC<Props> = ({ id, value, onChange, placeholder, disabled = false }) => {
  const handleAnswerChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      const input = event.target.value;
      if (input === "") {
        onChange(null);
      } else if (/^-?\d+$/.test(input)) {
        onChange(parseInt(input, 10));
      }
    }
  };

  return (
    <div className="mb-4 rounded-xl bg-gray-50 p-4 shadow-md dark:bg-gray-800 md:p-6">
      <div className="mb-4 flex flex-row items-center">
        <h3 className="text-sm font-semibold md:text-xl">Question {id}</h3>
        {value !== null && (
          <>
            <CheckCircleIcon className="ml-auto h-5 w-5 text-emerald-500 " />
            <span className="ml-2 text-xs md:text-base">
              {disabled ? "Submitted" : "Saved Locally"}
            </span>
          </>
        )}
      </div>
      <input
        type="text"
        inputMode="numeric"
        pattern="-?[0-9]*"
        value={value === null ? "" : value.toString()}
        onChange={handleAnswerChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-gray-400 bg-gray-200 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 ${
          disabled ? "cursor-not-allowed opacity-70" : ""
        }`}
        required
        maxLength={10} // Reasonable max length for integers
        disabled={disabled}
      />
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Enter an integer answer (positive or negative)
      </p>
    </div>
  );
};

export default Question;
