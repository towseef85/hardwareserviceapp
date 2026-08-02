import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

type FormFieldProps = {
  label: string;
  fieldName: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  children?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormField({
  label,
  fieldName,
  error,
  required = false,
  helperText,
  children,
  className,
  ...inputProps
}: FormFieldProps) {
  const errorId = `${fieldName}-error`;
  const helperId = `${fieldName}-helper`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldName}
        className="block text-sm font-medium text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children ?? (
        <input
          id={fieldName}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? errorId
              : helperText
                ? helperId
                : undefined
          }
          className={[
            "h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition",
            "placeholder:text-slate-400",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100",
            className ?? "",
          ].join(" ")}
          {...inputProps}
        />
      )}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-red-600"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={helperId}
          className="text-xs text-slate-500"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}