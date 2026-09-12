export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";

export type OpportunityType = "VOLUNTEER" | "PAID";
export type Modality = "REMOTE" | "ONSITE" | "HYBRID";
export type OpportunityStatus = "DRAFT" | "ACTIVE" | "CLOSED";
export type ApplicationStatus =
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN";

export type Opportunity = {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  modality: Modality;
  weeklyHours: number | null;
  skills: string[];
  status: OpportunityStatus;
  isFeatured: boolean;
  featuredAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** `null` quando o organizador publica em nome próprio. */
  organization: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
  _count: { applications: number };
};

export type PremiumSubscription = {
  id: string;
  status: "ACTIVE" | "CANCELED";
  billingCycle: "MONTHLY" | "YEARLY";
  priceCents: number;
  paymentMethodLast4: string;
  featuredCredits: number;
  startedAt: string;
  nextBillingAt: string;
};

export type PremiumPayment = {
  id: string;
  gatewayId: string;
  billingCycle: "MONTHLY" | "YEARLY";
  amountCents: number;
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" | "REFUNDED" | "FAILED";
  expiresAt: string;
  paidAt: string | null;
  createdAt: string;
  brCode?: string;
  brCodeBase64?: string;
  devMode?: boolean;
};

export type PremiumPaymentResult = {
  payment: PremiumPayment;
  subscription: PremiumSubscription | null;
};

export type FeatureOpportunityResult = {
  opportunity: Opportunity;
  remainingFeaturedCredits: number;
};

export type Application = {
  id: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  opportunity: {
    id: string;
    title: string;
    status: OpportunityStatus;
    type: OpportunityType;
    modality: Modality;
    organization: { id: string; name: string } | null;
    createdBy: { id: string; name: string };
  };
  talent: {
    id: string;
    name: string;
    email: string;
    talentProfile: {
      bio: string | null;
      skills: string[];
      availability: string;
      portfolioLinks: string[];
    } | null;
  };
};

export type Organization = {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  ownerUserId: string;
};

export const typeLabels: Record<OpportunityType, string> = {
  VOLUNTEER: "Voluntário",
  PAID: "Remunerado",
};

export const modalityLabels: Record<Modality, string> = {
  REMOTE: "Remoto",
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
};

export const opportunityStatusLabels: Record<OpportunityStatus, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativa",
  CLOSED: "Encerrada",
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  UNDER_REVIEW: "Em análise",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
  WITHDRAWN: "Retirada",
};

export const applicationStatusStyles: Record<ApplicationStatus, string> = {
  UNDER_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-600",
  WITHDRAWN: "border-slate-200 bg-slate-100 text-slate-500",
};

export const opportunityStatusStyles: Record<OpportunityStatus, string> = {
  DRAFT: "border-slate-200 bg-slate-100 text-slate-600",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CLOSED: "border-slate-200 bg-slate-100 text-slate-500",
};

/** O nome exibido: a organização quando existe, senão a própria pessoa. */
export function opportunityAuthor(opportunity: Opportunity) {
  return opportunity.organization?.name ?? opportunity.createdBy.name;
}

export function apiMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object" || !("message" in data)) {
    return fallback;
  }

  const message = data.message;
  return Array.isArray(message) ? message.join(" ") : String(message);
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { fallbackError?: string },
): Promise<T> {
  const { fallbackError, ...requestInit } = init ?? {};

  const response = await fetch(`${API_URL}${path}`, {
    ...requestInit,
    headers: {
      ...(requestInit.body ? { "Content-Type": "application/json" } : {}),
      ...requestInit.headers,
    },
  });

  // O Nest responde com corpo vazio quando o handler devolve `null` — é o caso
  // de um organizador sem organização —, então `response.json()` direto quebra.
  const raw = await response.text();
  const data: unknown = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    throw new Error(
      apiMessage(data, fallbackError ?? "Não foi possível concluir a ação."),
    );
  }

  return data as T;
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}
