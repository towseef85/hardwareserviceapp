"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createCityAction,
  updateCityAction,
  type CityActionResult,
} from "@/actions/cities";
import { FormField } from "@/components/common/form-field";
import { SubmitButton } from "@/components/common/submit-button";
import {
  citySchema,
  type CityFormValues,
} from "@/validations/city";

type CityFormProps = {
  mode?: "create" | "edit";
  cityId?: number;
  defaultValues?: CityFormValues;
};

export function CityForm({
  mode = "create",
  cityId,
  defaultValues = {
    code: "",
    engName: "",
    arbName: "",
  },
}: CityFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues,
    mode: "onTouched",
  });

  const isSaving = isSubmitting || isPending;
  const isEditMode = mode === "edit";

function applyServerErrors(result: CityActionResult) {
  if (result.success) {
    return;
  }

  if (result.fieldErrors?.code) {
    setError("code", {
      type: "server",
      message: result.fieldErrors.code,
    });
  }

  if (result.fieldErrors?.engName) {
    setError("engName", {
      type: "server",
      message: result.fieldErrors.engName,
    });
  }

  if (result.fieldErrors?.arbName) {
    setError("arbName", {
      type: "server",
      message: result.fieldErrors.arbName,
    });
  }

  if (!result.fieldErrors) {
    setError("root", {
      type: "server",
      message: result.message,
    });
  }
}

  const onSubmit: SubmitHandler<CityFormValues> = (
    values,
  ) => {
    clearErrors("root");

    startTransition(async () => {
      let result: CityActionResult;

      if (isEditMode) {
        if (!cityId) {
          setError("root", {
            type: "server",
            message: "The selected city is invalid.",
          });

          return;
        }

        result = await updateCityAction(cityId, values);
      } else {
        result = await createCityAction(values);
      }

      applyServerErrors(result);
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6"
    >
      {errors.root?.message && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errors.root.message}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          label="City Code"
          fieldName="code"
          required
          placeholder="For example, RUH"
          maxLength={20}
          autoComplete="off"
          error={errors.code?.message}
          helperText="A short unique code used to identify the city."
          {...register("code")}
        />

        <FormField
          label="English Name"
          fieldName="engName"
          required
          placeholder="For example, Riyadh"
          maxLength={150}
          autoComplete="off"
          error={errors.engName?.message}
          {...register("engName")}
        />

        <FormField
          label="Arabic Name"
          fieldName="arbName"
          placeholder="For example, الرياض"
          maxLength={150}
          autoComplete="off"
          dir="rtl"
          error={errors.arbName?.message}
          {...register("arbName")}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/cities"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
        >
          Cancel
        </Link>

        <SubmitButton
          isSubmitting={isSaving}
          label={isEditMode ? "Update" : "Save"}
          submittingLabel={
            isEditMode ? "Updating..." : "Saving..."
          }
        />
      </div>
    </form>
  );
}