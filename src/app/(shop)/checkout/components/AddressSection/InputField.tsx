import { memo } from "react";
import { AlertCircle } from "lucide-react";

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  pattern?: string;
  maxLength?: number;
  placeholder?: string;
  error?: string;
  isTouched?: boolean;
}

export const InputField = memo<InputFieldProps>(
  ({
    label,
    name,
    type = "text",
    required = false,
    value,
    onChange,
    pattern,
    maxLength,
    placeholder,
    error,
    isTouched,
    ...props
  }) => {
    const hasError = error && isTouched;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}{" "}
          {required && (
            <span className="text-red-500 dark:text-red-400">*</span>
          )}
        </label>
        <input
          type={type}
          name={name}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          pattern={pattern}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border transition-colors focus:outline-none focus:ring-2 focus:border-transparent rounded-xs ${
            hasError
              ? "border-red-300 dark:border-red-700 focus:ring-red-500 dark:focus:ring-red-400 bg-red-50 dark:bg-red-900/20 text-gray-900 dark:text-white"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          }`}
          {...props}
        />
        {hasError && (
          <div className="flex items-center gap-1 mt-1 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  },
);

InputField.displayName = "InputField";
