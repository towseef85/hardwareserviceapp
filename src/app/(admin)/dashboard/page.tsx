import {
  Building2,
  ClipboardList,
  ContactRound,
  MapPin,
  Store,
} from "lucide-react";
import { redirect } from "next/navigation";

import { SummaryCard } from "@/components/dashboard/summary-card";
import { ServicesTable } from "@/components/services/services-table";
import {
  getAdminDashboardData,
  getStoreAdminDashboardData,
  getTechnicianDashboardData,
} from "@/data/dashboard";
import {
  getCurrentUserAccess,
  hasRole,
} from "@/lib/current-user";

export default async function DashboardPage() {
  const access = await getCurrentUserAccess();

  if (access.status === "unauthenticated") redirect("/login");
  if (access.status === "profile-missing") {
    redirect("/profile-required");
  }
  if (access.status === "inactive") {
    redirect("/account-disabled");
  }

  if (hasRole(access.role, "admin")) {
    const data = await getAdminDashboardData();

    return (
      <DashboardShell
        title="Admin Dashboard"
        description="System-wide Store administration overview."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Cities"
            value={data.totalCities}
            icon={MapPin}
            href="/cities"
          />
          <SummaryCard
            title="Total Stores"
            value={data.totalStores}
            icon={Store}
            href="/stores"
          />
          <SummaryCard
            title="Total Customers"
            value={data.totalCustomers}
            icon={ContactRound}
            href="/customers"
          />
          <SummaryCard
            title="Total Services"
            value={data.totalServices}
            icon={ClipboardList}
            href="/services"
          />
        </div>

        <ServiceSection
          title="Latest 10 Services"
          description="Most recently created Services across all Stores."
        >
          <ServicesTable
            items={data.recentServices.map((service) => ({
              ...service,
              createdAt: service.createdAt.toISOString(),
            }))}
            canUpdate={false}
            canDelete={false}
          />
        </ServiceSection>
      </DashboardShell>
    );
  }

  if (hasRole(access.role, "store-admin")) {
    const data = await getStoreAdminDashboardData(
      access.storeId,
    );

    return (
      <DashboardShell
        title="Store Dashboard"
        description="Overview of your assigned Store and its repair activity."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="Assigned Stores"
            value={data.totalStores}
            icon={Building2}
            subtitle={
              data.assignedStore
                ? `${data.assignedStore.name} (${data.assignedStore.code}) · ${data.assignedStore.cityName}`
                : "No Store assigned"
            }
          />
          <SummaryCard
            title="Store Customers"
            value={data.totalCustomers}
            icon={ContactRound}
            href="/customers"
          />
          <SummaryCard
            title="Store Services"
            value={data.totalServices}
            icon={ClipboardList}
            href="/services"
          />
        </div>

        <ServiceSection
          title="Latest 10 Store Services"
          description="Most recently created Services for your assigned Store."
        >
          <ServicesTable
            items={data.recentServices.map((service) => ({
              ...service,
              createdAt: service.createdAt.toISOString(),
            }))}
            canUpdate={false}
            canDelete={false}
          />
        </ServiceSection>
      </DashboardShell>
    );
  }

  if (hasRole(access.role, "technician")) {
    const data = await getTechnicianDashboardData(
      access.profileId,
    );

    return (
      <DashboardShell
        title="Technician Dashboard"
        description="Your 10 most recently assigned Services."
      >
        <ServicesTable
          items={data.recentServices.map((service) => ({
            ...service,
            createdAt: service.createdAt.toISOString(),
          }))}
          technicianView
          canUpdate={false}
          canDelete={false}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Dashboard"
      description="You do not currently have an application role."
    >
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        Contact an administrator to assign your account an application role.
      </div>
    </DashboardShell>
  );
}

function DashboardShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

function ServiceSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
