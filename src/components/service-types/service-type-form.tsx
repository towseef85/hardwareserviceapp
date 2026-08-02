"use client";
import Link from "next/link";
import { useTransition } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createServiceTypeAction, updateServiceTypeAction, type ServiceTypeActionResult } from "@/actions/service-types";
import { FormField } from "@/components/common/form-field";
import { SubmitButton } from "@/components/common/submit-button";
import { serviceTypeSchema, type ServiceTypeFormValues } from "@/validations/service-type";

type Props = { stores: Array<{ id: number; code: string; engName: string }>; mode?: "create" | "edit"; serviceTypeId?: number; defaultValues?: ServiceTypeFormValues };
export function ServiceTypeForm({ stores, mode = "create", serviceTypeId, defaultValues = { storeId: "", name: "", isActive: true, description: "" } }: Props) {
  const [pending, startTransition] = useTransition(); const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<ServiceTypeFormValues>({ resolver: zodResolver(serviceTypeSchema), defaultValues, mode: "onTouched" });
  function errorsFrom(result: ServiceTypeActionResult) { if (result.success) return; let found = false; for (const field of ["storeId", "name", "description", "isActive"] as const) { const message = result.fieldErrors?.[field]; if (message) { found = true; setError(field, { type: "server", message }); } } if (!found) setError("root", { type: "server", message: result.message }); }
  const submit: SubmitHandler<ServiceTypeFormValues> = (values) => { clearErrors(); startTransition(async () => errorsFrom(mode === "edit" && serviceTypeId ? await updateServiceTypeAction(serviceTypeId, values) : await createServiceTypeAction(values))); };
  return <form onSubmit={handleSubmit(submit)} className="space-y-6" noValidate>{errors.root?.message && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errors.root.message}</div>}<div className="grid gap-5 md:grid-cols-2">
    <div className="space-y-2"><label htmlFor="storeId" className="block text-sm font-medium text-slate-700">Store *</label><select id="storeId" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm" {...register("storeId")}><option value="">Select a Store</option>{stores.map((s) => <option key={s.id} value={s.id}>{s.engName} ({s.code})</option>)}</select>{errors.storeId?.message && <p className="text-sm text-red-600">{errors.storeId.message}</p>}</div>
    <FormField label="Name" fieldName="name" required maxLength={150} error={errors.name?.message} {...register("name")} />
    <div className="space-y-2 md:col-span-2"><label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label><textarea id="description" rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" {...register("description")} />{errors.description?.message && <p className="text-sm text-red-600">{errors.description.message}</p>}</div>
  </div><label className="flex items-center gap-3"><input type="checkbox" className="size-4 rounded border-slate-300" {...register("isActive")} /><span className="text-sm font-medium text-slate-700">Active Service Type</span></label><div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end"><Link href="/service-types" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-medium">Cancel</Link><SubmitButton isSubmitting={pending || isSubmitting} label={mode === "edit" ? "Update Service Type" : "Create Service Type"} /></div></form>;
}
