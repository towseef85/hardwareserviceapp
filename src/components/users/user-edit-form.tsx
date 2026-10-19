"use client";

import Link from "next/link";
import { useMemo, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";

import { updateUserAction } from "@/actions/users";
import { FormField } from "@/components/common/form-field";
import { SubmitButton } from "@/components/common/submit-button";
import { userEditSchema, type UserEditFormValues } from "@/validations/user";

type Option = { id: number; code: string; engName: string };
type StoreOption = Option & { cityId: number };

type UserEditFormProps = {
  userId: number;
  cities: Option[];
  stores: StoreOption[];
  defaultValues: UserEditFormValues;
  hasLoginAccount: boolean;
};

export function UserEditForm({
  userId,
  cities,
  stores,
  defaultValues,
  hasLoginAccount,
}: UserEditFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues,
    mode: "onTouched",
  });
  const cityId = useWatch({ control, name: "cityId" });
  const filteredStores = useMemo(
    () => stores.filter((store) => store.cityId === Number(cityId)),
    [cityId, stores],
  );

  const onSubmit: SubmitHandler<UserEditFormValues> = (values) => {
    clearErrors();
    startTransition(async () => {
      const result = await updateUserAction(userId, values);
      if (result.success) return;
      const fields: Array<keyof UserEditFormValues> = [
        "role", "cityId", "storeId", "fullName", "contact",
        "email", "username", "isActive",
      ];
      let hasFieldError = false;
      for (const field of fields) {
        const message = result.fieldErrors?.[field];
        if (message) {
          hasFieldError = true;
          setError(field, { type: "server", message });
        }
      }
      if (!hasFieldError) {
        setError("root", { type: "server", message: result.message });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {errors.root?.message && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.root.message}
        </div>
      )}
      {!hasLoginAccount && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This profile has no login account. Profile details can be updated, but the role takes effect after a login is created.
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Role <span className="text-red-500">*</span></span>
          <select className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm" {...register("role")}>
            <option value="technician">Technician</option>
            <option value="store-admin">Store Admin</option>
            <option value="admin">System Admin</option>
          </select>
          {errors.role?.message && <p className="text-sm text-red-600">{errors.role.message}</p>}
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>City <span className="text-red-500">*</span></span>
          <select
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
            value={cityId}
            onChange={(event) => {
              setValue("cityId", event.target.value, { shouldValidate: true, shouldTouch: true });
              setValue("storeId", "", { shouldValidate: false });
              clearErrors("storeId");
            }}
          >
            <option value="">Select a City</option>
            {cities.map((city) => <option key={city.id} value={city.id}>{city.engName} ({city.code})</option>)}
          </select>
          {errors.cityId?.message && <p className="text-sm text-red-600">{errors.cityId.message}</p>}
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Store <span className="text-red-500">*</span></span>
          <select className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm" {...register("storeId")}>
            <option value="">Select a Store</option>
            {filteredStores.map((store) => <option key={store.id} value={store.id}>{store.engName} ({store.code})</option>)}
          </select>
          {errors.storeId?.message && <p className="text-sm text-red-600">{errors.storeId.message}</p>}
        </label>
        <FormField label="Full Name" fieldName="fullName" required maxLength={150} error={errors.fullName?.message} {...register("fullName")} />
        <FormField label="Contact" fieldName="contact" type="tel" maxLength={30} error={errors.contact?.message} {...register("contact")} />
        <FormField label="Email" fieldName="email" type="email" required maxLength={255} error={errors.email?.message} {...register("email")} />
        <FormField label="Username" fieldName="username" required maxLength={30} error={errors.username?.message} {...register("username")} />
      </div>
      <label className="flex items-center gap-3">
        <input type="checkbox" className="size-4 rounded border-slate-300" {...register("isActive")} />
        <span className="text-sm font-medium text-slate-700">Active User</span>
      </label>
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link href="/users" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</Link>
        <SubmitButton isSubmitting={isSubmitting || isPending} label="Save Changes" submittingLabel="Saving..." />
      </div>
    </form>
  );
}
