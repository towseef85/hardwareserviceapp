"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createCustomerAction, updateCustomerAction, type CustomerActionResult } from "@/actions/customers";
import { FormField } from "@/components/common/form-field";
import { SubmitButton } from "@/components/common/submit-button";
import { customerSchema, type CustomerFormValues } from "@/validations/customer";

type Props = {
  stores: Array<{ id: number; code: string; engName: string }>;
  mode?: "create" | "edit";
  customerId?: number;
  defaultValues?: CustomerFormValues;
};

export function CustomerForm({ stores, mode = "create", customerId, defaultValues = { storeId: "", fullName: "", mobile: "", email: "", address: "" } }: Props) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<CustomerFormValues>({ resolver: zodResolver(customerSchema), defaultValues, mode: "onTouched" });

  function applyErrors(result: CustomerActionResult) {
    if (result.success) return;
    let hasFieldError = false;
    for (const field of ["storeId", "fullName", "mobile", "email", "address"] as const) {
      const message = result.fieldErrors?.[field];
      if (message) { hasFieldError = true; setError(field, { type: "server", message }); }
    }
    if (!hasFieldError) setError("root", { type: "server", message: result.message });
  }

  const onSubmit: SubmitHandler<CustomerFormValues> = (values) => {
    clearErrors();
    startTransition(async () => {
      const result = mode === "edit" && customerId
        ? await updateCustomerAction(customerId, values)
        : await createCustomerAction(values);
      applyErrors(result);
    });
  };

  return <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
    {errors.root?.message && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errors.root.message}</div>}
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="storeId" className="block text-sm font-medium text-slate-700">Store <span className="text-red-500">*</span></label>
        <select id="storeId" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm" {...register("storeId")}> 
          <option value="">Select a Store</option>
          {stores.map((store) => <option key={store.id} value={store.id}>{store.engName} ({store.code})</option>)}
        </select>
        {errors.storeId?.message && <p className="text-sm text-red-600">{errors.storeId.message}</p>}
      </div>
      <FormField label="Full Name" fieldName="fullName" required maxLength={150} error={errors.fullName?.message} {...register("fullName")} />
      <FormField label="Mobile" fieldName="mobile" type="tel" required maxLength={30} error={errors.mobile?.message} {...register("mobile")} />
      <FormField label="Email" fieldName="email" type="email" maxLength={255} error={errors.email?.message} {...register("email")} />
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address</label>
        <textarea id="address" rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" {...register("address")} />
        {errors.address?.message && <p className="text-sm text-red-600">{errors.address.message}</p>}
      </div>
    </div>
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
      <Link href="/customers" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-medium">Cancel</Link>
      <SubmitButton isSubmitting={isSubmitting || isPending} label={mode === "edit" ? "Update Customer" : "Create Customer"} />
    </div>
  </form>;
}
