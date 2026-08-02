"use client";

import Link from "next/link";
import { useMemo, useTransition } from "react";
import {
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserAction,
  type UserActionResult,
} from "@/actions/users";
import { FormField } from "@/components/common/form-field";
import { SubmitButton } from "@/components/common/submit-button";
import {
  userSchema,
  type UserFormValues,
} from "@/validations/user";

type CityOption = {
  id: number;
  code: string;
  engName: string;
};

type StoreOption = {
  id: number;
  code: string;
  engName: string;
  cityId: number;
};

type UserFormProps = {
  cities: CityOption[];
  stores: StoreOption[];
};

export function UserForm({
  cities,
  stores,
}: UserFormProps) {
  const [isPending, startTransition] =
    useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "technician",
      cityId: "",
      storeId: "",
      fullName: "",
      contact: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      isActive: true,
    },
    mode: "onTouched",
  });

  const selectedCityId = useWatch({
    control,
    name: "cityId",
  });

  const filteredStores = useMemo(() => {
    if (!selectedCityId) {
      return [];
    }

    return stores.filter(
      (store) =>
        store.cityId === Number(selectedCityId),
    );
  }, [selectedCityId, stores]);

  const isSaving = isSubmitting || isPending;

  function handleCityChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    setValue("cityId", event.target.value, {
      shouldValidate: true,
      shouldTouch: true,
    });

    setValue("storeId", "", {
      shouldValidate: false,
    });

    clearErrors("storeId");
  }

  function applyServerErrors(
    result: UserActionResult,
  ) {
    if (result.success) {
      return;
    }

    const fields: Array<keyof UserFormValues> = [
      "role",
      "cityId",
      "storeId",
      "fullName",
      "contact",
      "email",
      "username",
      "password",
      "confirmPassword",
      "isActive",
    ];

    let hasFieldError = false;

    for (const field of fields) {
      const message = result.fieldErrors?.[field];

      if (message) {
        hasFieldError = true;

        setError(field, {
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

  const onSubmit: SubmitHandler<UserFormValues> = (
    values,
  ) => {
    clearErrors();

    startTransition(async () => {
      const result =
        await createUserAction(values);

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
        <div className="space-y-2">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-slate-700"
          >
            Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
            {...register("role")}
          >
            <option value="technician">Technician</option>
            <option value="store-admin">Store Admin</option>
          </select>
          {errors.role?.message && (
            <p className="text-sm text-red-600">
              {errors.role.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="cityId"
            className="block text-sm font-medium text-slate-700"
          >
            City
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <select
            id="cityId"
            value={selectedCityId}
            onChange={handleCityChange}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
          >
            <option value="">Select a City</option>

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
            <p className="text-sm text-red-600">
              {errors.cityId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="storeId"
            className="block text-sm font-medium text-slate-700"
          >
            Store
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <select
            id="storeId"
            disabled={!selectedCityId}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
            {...register("storeId")}
          >
            <option value="">
              {selectedCityId
                ? "Select a Store"
                : "Select a City first"}
            </option>

            {filteredStores.map((store) => (
              <option
                key={store.id}
                value={String(store.id)}
              >
                {store.engName} ({store.code})
              </option>
            ))}
          </select>

          {errors.storeId?.message && (
            <p className="text-sm text-red-600">
              {errors.storeId.message}
            </p>
          )}
        </div>

        <FormField
          label="Full Name"
          fieldName="fullName"
          required
          placeholder="Enter the User's full name"
          maxLength={150}
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <FormField
          label="Contact"
          fieldName="contact"
          type="tel"
          placeholder="+966 50 000 0000"
          maxLength={30}
          error={errors.contact?.message}
          {...register("contact")}
        />

        <FormField
          label="Email"
          fieldName="email"
          type="email"
          required
          placeholder="user@example.com"
          maxLength={255}
          error={errors.email?.message}
          {...register("email")}
        />

        <FormField
          label="Username"
          fieldName="username"
          required
          placeholder="For example, ahmed.ali"
          maxLength={30}
          error={errors.username?.message}
          {...register("username")}
        />

        <FormField
          label="Password"
          fieldName="password"
          type="password"
          required
          placeholder="Minimum 8 characters"
          maxLength={128}
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <FormField
          label="Confirm Password"
          fieldName="confirmPassword"
          type="password"
          required
          placeholder="Repeat the password"
          maxLength={128}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="size-4 rounded border-slate-300"
          {...register("isActive")}
        />

        <span className="text-sm font-medium text-slate-700">
          Active User
        </span>
      </label>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link
          href="/users"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>

        <SubmitButton
          isSubmitting={isSaving}
          label="Create User"
          submittingLabel="Creating..."
        />
      </div>
    </form>
  );
}
