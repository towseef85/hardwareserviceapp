import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import {
  getServiceById,
  getServiceStatusHistory,
  getTechnicianServiceById,
} from "@/data/services";
import { requirePermission } from "@/lib/authorization";
import { hasRole } from "@/lib/current-user";
import { TechnicianStatusControl } from "@/components/services/technician-status-control";
import { ServiceStatusTimeline } from "@/components/services/service-status-timeline";

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requirePermission("services", "view");
  if (!access.allowed) redirect("/unauthorized");

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const technician = hasRole(access.user.role, "technician");
  const technicianService = technician
    ? await getTechnicianServiceById(id, access.user.profileId)
    : null;
  const fullService = technician
    ? null
    : await getServiceById(id, {
        storeId: hasRole(access.user.role, "admin")
          ? undefined
          : access.user.storeId,
      });
  const service = technicianService ?? fullService;
  if (!service) notFound();
  const statusHistory = await getServiceStatusHistory(id);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm text-slate-600">
          <ArrowLeft size={17} /> Back to Services
        </Link>
        {fullService && access.permission.canUpdate && (
          <Link href={`/services/${id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white">
            <Pencil size={17} /> Edit Service
          </Link>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{service.code}</h1>
        <p className="mt-1 text-sm capitalize text-slate-500">Status: {service.status}</p>
      </div>

      {technicianService && (
        <TechnicianStatusControl
          serviceId={technicianService.id}
          currentStatus={technicianService.status}
        />
      )}

      <div
        className={
          fullService
            ? "grid gap-6 lg:grid-cols-2"
            : "grid w-full gap-6"
        }
      >
        <Card title="Service Details">
          <Row label="Service Code" value={service.code} />
          <Row label="Service Type" value={service.serviceTypeName} />
          <Row label="Description" value={service.description ?? "—"} />
          {fullService && (
            <Row
              label="Technician"
              value={fullService.technicianName ?? "Unassigned"}
            />
          )}
          <Row label="Created" value={new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(service.createdAt)} />
        </Card>

        {fullService && (
          <>
            <Card title="Customer Details">
              <Row label="Full Name" value={fullService.customerName} />
              <Row label="Mobile" value={fullService.customerMobile} />
              <Row label="Email" value={fullService.customerEmail ?? "—"} />
              <Row label="Address" value={fullService.customerAddress ?? "—"} />
            </Card>
          </>
        )}
      </div>

      <ServiceStatusTimeline history={statusHistory} />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-slate-200 bg-white shadow-sm"><h2 className="border-b px-5 py-4 font-semibold text-slate-900">{title}</h2><dl className="divide-y px-5">{children}</dl></section>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="py-4"><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{value}</dd></div>;
}
