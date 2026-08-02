"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createStoreAction,
  updateStoreAction,
  type StoreActionResult,
} from "@/actions/stores";
import { FormField } from "@/components/common/form-field";
import { SubmitButton } from "@/components/common/submit-button";
import {
  storeSchema,
  type StoreFormValues,
} from "@/validations/store";

export type CityOption = {
  id: number;
  code: string;
  engName: string;
};

type StoreFormProps = {
  cities: CityOption[];
  mode?: "create" | "edit";
  storeId?: number;
  defaultValues?: StoreFormValues;
};

export function StoreForm({
  cities,
  mode = "create",
  storeId,
  defaultValues = {
    code: "",
    engName: "",
    arbName: "",
    cityId: "",
    phone: "",
    email: "",
    address: "",
  },
}: StoreFormProps) {
  const [isPending, startTransition] =
    useTransition();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: defaultValues,
    mode: "onTouched",
  });

  const isSaving = isSubmitting || isPending;
  const isEditMode = mode === "edit";
  
  function applyServerErrors(
    result: StoreActionResult,
  ) {
    if (result.success) {
      return;
    }

    const fieldNames: Array<
      keyof StoreFormValues
    > = [
      "code",
      "engName",
      "arbName",
      "cityId",
      "phone",
      "email",
      "address",
    ];

    let hasFieldError = false;

    for (const fieldName of fieldNames) {
      const message =
        result.fieldErrors?.[fieldName];

      if (message) {
        hasFieldError = true;

        setError(fieldName, {
          type: "server",
          message,
        });
      }
    }

    if (!hasFieldError) {
      setError("root", {
        type: "server",
        message: result.message,
      });
    }
  }

const onSubmit: SubmitHandler<
  StoreFormValues
> = (values) => {
  clearErrors();

  startTransition(async () => {
    let result: StoreActionResult;

    if (isEditMode) {
      if (!storeId) {
        setError("root", {
          type: "server",
          message: "The selected Store is invalid.",
        });

        return;
      }

      result = await updateStoreAction(
        storeId,
        values,
      );
    } else {
      result = await createStoreAction(values);
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
          label="Store Code"
          fieldName="code"
          required
          placeholder="For example, STR-RUH-01"
          maxLength={30}
          autoComplete="off"
          error={errors.code?.message}
          helperText="A unique code used to identify the Store."
          {...register("code")}
        />

        <FormField
          label="English Name"
          fieldName="engName"
          required
          placeholder="For example, Riyadh Main Store"
          maxLength={150}
          autoComplete="off"
          error={errors.engName?.message}
          {...register("engName")}
        />

        <FormField
          label="Arabic Name"
          fieldName="arbName"
          placeholder="For example, فرع الرياض الرئيسي"
          maxLength={150}
          autoComplete="off"
          dir="rtl"
          error={errors.arbName?.message}
          {...register("arbName")}
        />

        <div className="space-y-2">
          <label
            htmlFor="cityId"
            className="block text-sm font-medium text-slate-700"
          >
            City

            <span
              className="ml-1 text-red-500"
              aria-hidden="true"
            >
              *
            </span>
          </label>

          <select
            id="cityId"
            aria-invalid={Boolean(
              errors.cityId,
            )}
            aria-describedby={
              errors.cityId
                ? "cityId-error"
                : undefined
            }
            className={[
              "h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition",
              errors.cityId
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100",
            ].join(" ")}
            {...register("cityId")}
          >
            <option value="">
              Select a City
            </option>

            {cities.map((city) => (
              <option
                key={city.id}
                value={String(city.id)}
              >
                {city.engName} ({city.code})
              </option>
            ))}
          </select>

          {errors.cityId?.message && (
            <p
              id="cityId-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {errors.cityId.message}
            </p>
          )}
        </div>

        <FormField
          label="Phone"
          fieldName="phone"
          type="tel"
          placeholder="For example, +966 11 000 0001"
          maxLength={30}
          autoComplete="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <FormField
          label="Email"
          fieldName="email"
          type="email"
          placeholder="For example, store@example.com"
          maxLength={255}
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="address"
          className="block text-sm font-medium text-slate-700"
        >
          Address
        </label>

        <textarea
          id="address"
          rows={4}
          maxLength={1000}
          placeholder="Enter the Store address"
          aria-invalid={Boolean(
            errors.address,
          )}
          aria-describedby={
            errors.address
              ? "address-error"
              : undefined
          }
          className={[
            "w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition",
            "placeholder:text-slate-400",
            errors.address
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100",
          ].join(" ")}
          {...register("address")}
        />

        {errors.address?.message && (
          <p
            id="address-error"
            role="alert"
            className="text-sm text-red-600"
          >
            {errors.address.message}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/stores"
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