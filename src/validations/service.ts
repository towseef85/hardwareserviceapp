import { z } from "zod";

export const SERVICE_STATUSES = ["created", "working", "tested", "completed", "delivered"] as const;
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export const TECHNICIAN_SERVICE_STATUSES = [
  "working",
  "tested",
  "completed",
] as const;

export const technicianServiceStatusSchema = z.enum(
  TECHNICIAN_SERVICE_STATUSES,
);

export const serviceSchema = z.object({
  storeId: z.string().trim().regex(/^\d+$/, "Select a valid Store."),
  serviceTypeId: z.string().trim().regex(/^\d+$/, "Select a valid Service Type."),
  customerId: z.string().trim().regex(/^\d+$/, "Select a valid Customer."),
  assignedTechnicianId: z.union([z.literal(""), z.string().trim().regex(/^\d+$/, "Select a valid Technician.")]),
  description: z.string().trim().max(2000),
  status: z.enum(SERVICE_STATUSES),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
