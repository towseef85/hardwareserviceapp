"use client";

import { useState, useTransition } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  X,
} from "lucide-react";

import {
  changeUserPasswordAction,
  type ChangePasswordActionResult,
} from "@/actions/passwords";
import { adminChangePasswordSchema } from "@/validations/password";

type ChangePasswordDialogProps = {
  user: {
    id: number;
    fullName: string;
    username: string;
    hasLoginAccount: boolean;
  } | null;
  onClose: () => void;
};

type FieldErrors = {
  newPassword?: string;
  confirmPassword?: string;
};

export function ChangePasswordDialog({
  user,
  onClose,
}: ChangePasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>({});
  const [result, setResult] =
    useState<ChangePasswordActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!user) {
    return null;
  }

  function closeDialog() {
    if (isPending) return;
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setFieldErrors({});
    setResult(null);
    onClose();
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (!user) return;
    setResult(null);

    const values = {
      newPassword,
      confirmPassword,
    };
    const validationResult =
      adminChangePasswordSchema.safeParse(values);

    if (!validationResult.success) {
      const errors =
        validationResult.error.flatten().fieldErrors;
      setFieldErrors({
        newPassword: errors.newPassword?.[0],
        confirmPassword: errors.confirmPassword?.[0],
      });
      return;
    }

    setFieldErrors({});
    const userId = user.id;

    startTransition(async () => {
      const actionResult = await changeUserPasswordAction(
        userId,
        values,
      );

      setResult(actionResult);

      if (!actionResult.success) {
        setFieldErrors(actionResult.fieldErrors ?? {});
        return;
      }

      setNewPassword("");
      setConfirmPassword("");
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
    >
      <button
        type="button"
        aria-label="Close change password dialog"
        onClick={closeDialog}
        disabled={isPending}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px]"
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <KeyRound size={20} />
            </div>
            <div>
              <h2
                id="change-password-title"
                className="font-semibold text-slate-900"
              >
                {user.hasLoginAccount
                  ? "Change Password"
                  : "Create Login Password"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {user.hasLoginAccount
                  ? "Set a new password"
                  : "Create a Technician login and set its password"}{" "}
                for {user.fullName} (@{user.username}).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDialog}
            disabled={isPending}
            aria-label="Close"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {result && (
            <div
              role={result.success ? "status" : "alert"}
              className={[
                "rounded-lg border px-4 py-3 text-sm",
                result.success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700",
              ].join(" ")}
            >
              {result.message}
            </div>
          )}

          <PasswordField
            id="newPassword"
            label="New Password"
            value={newPassword}
            showPassword={showPassword}
            error={fieldErrors.newPassword}
            autoComplete="new-password"
            onChange={(value) => {
              setNewPassword(value);
              setFieldErrors((errors) => ({
                ...errors,
                newPassword: undefined,
              }));
              setResult(null);
            }}
            onToggleVisibility={() =>
              setShowPassword((visible) => !visible)
            }
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm Password"
            value={confirmPassword}
            showPassword={showPassword}
            error={fieldErrors.confirmPassword}
            autoComplete="new-password"
            onChange={(value) => {
              setConfirmPassword(value);
              setFieldErrors((errors) => ({
                ...errors,
                confirmPassword: undefined,
              }));
              setResult(null);
            }}
            onToggleVisibility={() =>
              setShowPassword((visible) => !visible)
            }
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeDialog}
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {result?.success ? "Close" : "Cancel"}
          </button>
          {!result?.success && (
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 min-w-36 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                  Changing...
                </>
              ) : (
                <>
                  <KeyRound size={17} />
                  {user.hasLoginAccount
                    ? "Change Password"
                    : "Create Login"}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  showPassword: boolean;
  error?: string;
  autoComplete: string;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
};

function PasswordField({
  id,
  label,
  value,
  showPassword,
  error,
  autoComplete,
  onChange,
  onToggleVisibility,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          maxLength={128}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-11 text-sm text-slate-900 caret-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label={
            showPassword ? "Hide password" : "Show password"
          }
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-slate-800"
        >
          {showPassword ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
