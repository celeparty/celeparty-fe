import React from "react";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface ValidatedInputProps {
  label: string;
  value?: string;
  error?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  children?: React.ReactNode;
  helperText?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
}

/**
 * Input field with live validation indicators
 */
export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(({
  label,
  value,
  error,
  placeholder,
  type = "text",
  required,
  maxLength,
  minLength,
  helperText,
  className = "",
  onChange,
  onBlur,
  name,
  children,
  ...props
}, ref) => {
  const hasError = Boolean(error);
  const hasValue = Boolean(value);
  const isValid = hasValue && !hasError;

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          ref={ref}
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full px-4 py-3 border-2 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-offset-0 ${
            hasError
              ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200"
              : isValid
                ? "border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          } text-gray-700 text-sm lg:text-base ${className}`}
          {...props}
        />
        {hasError && (
          <AlertTriangle className="absolute right-3 top-3.5 text-red-500 w-5 h-5" />
        )}
        {isValid && (
          <CheckCircle className="absolute right-3 top-3.5 text-green-500 w-5 h-5" />
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-1 text-red-500 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {helperText && !error && (
        <div className="text-gray-500 text-xs mt-1">{helperText}</div>
      )}
    </div>
  );
});

ValidatedInput.displayName = "ValidatedInput";

/**
 * Textarea field with live validation indicators
 */
export const ValidatedTextarea = React.forwardRef<HTMLTextAreaElement, ValidatedInputProps>(({
  label,
  value,
  error,
  placeholder,
  required,
  maxLength,
  minLength,
  helperText,
  className = "",
  onChange,
  onBlur,
  name,
  ...props
}, ref) => {
  const hasError = Boolean(error);
  const hasValue = Boolean(value);
  const isValid = hasValue && !hasError;

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <textarea
          ref={ref}
          name={name}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
          onChange={onChange as any}
          onBlur={onBlur as any}
          className={`w-full px-4 py-3 border-2 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-offset-0 min-h-[100px] ${
            hasError
              ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200"
              : isValid
                ? "border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
          } text-gray-700 text-sm lg:text-base ${className}`}
          {...props}
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-1 text-red-500 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {helperText && !error && (
        <div className="text-gray-500 text-xs mt-1">{helperText}</div>
      )}
    </div>
  );
});

ValidatedTextarea.displayName = "ValidatedTextarea";
