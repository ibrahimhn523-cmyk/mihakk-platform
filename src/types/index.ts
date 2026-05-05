export type UserRole =
  | "super_admin"
  | "program_manager"
  | "supervisor"
  | "accountant"
  | "media"
  | "student"
  | "parent";

export type TenantStatus = "active" | "inactive" | "suspended";
export type StudentStatus = "active" | "inactive" | "graduated";
export type EnrollmentStatus = "active" | "completed" | "cancelled" | "pending";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type PaymentMethod = "cash" | "transfer" | "online" | "other";
export type SubscriptionType = "full" | "first_half" | "second_half" | "trial";
export type ProgramStatus = "upcoming" | "active" | "completed" | "cancelled";

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: TenantStatus;
  branding?: {
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
  };
  created_at: string;
}

export interface Program {
  id: string;
  tenant_id: string;
  name: string;
  season?: string;
  start_date: string;
  end_date: string;
  price_full: number;
  price_first: number;
  price_second: number;
  price_trial: number;
  status: ProgramStatus;
  created_at: string;
}

export interface Student {
  id: string;
  tenant_id: string;
  full_name: string;
  grade?: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_phone2?: string;
  notes?: string;
  status: StudentStatus;
  created_at: string;
}

export interface Enrollment {
  id: string;
  tenant_id: string;
  student_id: string;
  program_id: string;
  subscription_type: SubscriptionType;
  amount_due: number;
  amount_paid: number;
  start_date: string;
  end_date: string;
  status: EnrollmentStatus;
  created_at: string;
  student?: Student;
  program?: Program;
}

export interface Payment {
  id: string;
  tenant_id: string;
  enrollment_id: string;
  amount: number;
  method: PaymentMethod;
  method_note?: string;
  paid_at: string;
  created_by: string;
  notes?: string;
  enrollment?: Enrollment;
}

export interface Attendance {
  id: string;
  tenant_id: string;
  student_id: string;
  program_id: string;
  session_date: string;
  status: AttendanceStatus;
  notes?: string;
  created_by: string;
  student?: Student;
  program?: Program;
}

export interface Role {
  id: string;
  tenant_id: string;
  name: string;
  permissions: Record<string, boolean>;
}

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role_id: string;
  tenant_id: string;
  role?: Role;
}

export interface AuthUser {
  id: string;
  email: string;
  tenant_id?: string;
  role?: UserRole;
}
