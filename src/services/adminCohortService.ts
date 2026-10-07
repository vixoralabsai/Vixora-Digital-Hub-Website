import { getAdminToken } from './adminAuthService';

export type AdminCohortStatus =
  | 'draft'
  | 'open'
  | 'full'
  | 'closed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface AdminCohort {
  id: string;
  courseId: string;
  courseTitle: string;
  courseTrainingPlanId: string;
  trainingPlanId: string | null;
  trainingPlanName: string;
  trainingPlanShortName: string | null;
  planPriceNgn: number;
  name: string;
  code: string;
  startDate: string;
  endDate: string | null;
  status: AdminCohortStatus;
  capacity: number;
  enrolledCount: number;
  pendingReservations: number;
  availableSeats: number;
  tutorId: string | null;
  supervisorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CohortSetupOption {
  id: string;
  course_id: string;
  training_plan_id: string;
  price_ngn: number;
  capacity: number;
  enabled: boolean;
  training_plans?: {
    id: string;
    name: string;
    short_name: string;
    active: boolean;
  };
  courses?: {
    id: string;
    title: string;
  };
}

export interface AdminCohortOptions {
  trainingPlans: Array<{
    id: string;
    name: string;
    short_name: string;
    default_price_ngn: number;
    default_capacity: number;
    active: boolean;
  }>;
  courseTrainingPlans: CohortSetupOption[];
}

async function adminRequest(path: string, init: RequestInit = {}) {
  const token = await getAdminToken();
  if (!token) throw new Error('Your administrator session has expired. Please sign in again.');

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(path, { ...init, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(data.error || 'Administrator authorization failed.');
    }
    throw new Error(data.error || 'Admin request failed.');
  }

  return data;
}

export async function fetchAdminCohorts(): Promise<AdminCohort[]> {
  const data = await adminRequest('/api/admin/cohorts');
  return data.cohorts || [];
}

export async function fetchAdminCohortOptions(): Promise<AdminCohortOptions> {
  return adminRequest('/api/admin/cohort-options');
}

export interface SaveAdminCohortInput {
  name: string;
  code: string;
  courseTrainingPlanId: string;
  startDate: string;
  endDate?: string | null;
  status: AdminCohortStatus;
  capacity: number;
  tutorId?: string | null;
  supervisorId?: string | null;
}

export async function createAdminCohort(input: SaveAdminCohortInput) {
  return adminRequest('/api/admin/cohorts', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function updateAdminCohort(id: string, input: Partial<SaveAdminCohortInput>) {
  return adminRequest(`/api/admin/cohorts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  });
}
