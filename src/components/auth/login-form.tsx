"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, LogIn, User } from "lucide-react";
import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { authClient } from "@/lib/auth-client";
import {
  loginSchema,
  type LoginFormValues,
} from "@/validations/login";

export function LoginForm() {
  const router = useRouter();

  const [authenticationError, setAuthenticationError] =
    useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (
    values,
  ) => {
    setAuthenticationError(null);

    const { error } = await authClient.signIn.username({
      username: values.username.trim().toLowerCase(),
      password: values.password,
    });

    if (error) {
      setAuthenticationError(
        "The username or password is incorrect.",
      );

      return;
    }

    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      {authenticationError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {authenticationError}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-slate-700"
        >
          Username
        </label>

        <div className="relative">
          <User
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="username"
            type="text"
            autoComplete="username"
            autoFocus
            aria-invalid={Boolean(errors.username)}
            aria-describedby={
              errors.username
                ? "username-error"
                : undefined
            }
            placeholder="Enter your username"
            className={[
              "h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition",
              "placeholder:text-slate-400",
              errors.username
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100",
            ].join(" ")}
            {...register("username")}
          />
        </div>

        {errors.username?.message && (
          <p
            id="username-error"
            role="alert"
            className="text-sm text-red-600"
          >
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700"
        >
          Password
        </label>

        <div className="relative">
          <LockKeyhole
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password
                ? "password-error"
                : undefined
            }
            placeholder="Enter your password"
            className={[
              "h-11 w-full rounded-lg border bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition",
              "placeholder:text-slate-400",
              errors.password
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100",
            ].join(" ")}
            {...register("password")}
          />
        </div>

        {errors.password?.message && (
          <p
            id="password-error"
            role="alert"
            className="text-sm text-red-600"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn size={18} />

        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}