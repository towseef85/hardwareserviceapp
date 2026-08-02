import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { UserForm } from "@/components/users/user-form";
import { getCityOptions } from "@/data/cities";
import { getStoreOptions } from "@/data/stores";
import { requirePermission } from "@/lib/authorization";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Add User",
};

export default async function CreateUserPage() {
  const access = await requirePermission("users", "create");
  if (!access.allowed) redirect("/unauthorized");
  const [cityOptions, storeOptions] =
    await Promise.all([
      getCityOptions(),
      getStoreOptions(),
    ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={17} />
        Back to Users
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Add User
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create the User profile and login account.
        </p>
      </div>

      {cityOptions.length === 0 ||
      storeOptions.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">
            City and Store setup is required
          </h2>

          <p className="mt-1 text-sm text-amber-800">
            Create at least one City and Store before
            creating a User.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-900">
              User Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              The password will be handled securely by
              Better Auth.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <UserForm
              cities={cityOptions}
              stores={storeOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
}
