export type CourseMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type CourseStatus = 'ACTIVE' | 'INACTIVE';
export type BatchStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type TrainingStatus = 'ENROLLED' | 'ACTIVE' | 'COMPLETED' | 'DROPPED' | 'ON_HOLD';
export type PlacementStatus =
  | 'NOT_LOOKING'
  | 'LOOKING_FOR_JOB'
  | 'INTERVIEWING'
  | 'PLACED'
  | 'NOT_PLACED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type StudentType = 'FRESHER' | 'EXPERIENCED';

export interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  duration: string;
  fee: number;
  mode: CourseMode;
  status: CourseStatus;
  modules: string[];
  createdAt: string;
}

export interface Batch {
  _id: string;
  name: string;
  course: Course | string;
  trainer?: { _id: string; firstName: string; lastName: string } | string;
  startDate: string;
  endDate: string;
  timing?: string;
  capacity: number;
  status: BatchStatus;
  createdAt: string;
}

export interface StudentNote {
  text: string;
  createdBy: { _id: string; firstName: string; lastName: string } | string;
  createdAt: string;
}

export interface WorkHistoryEntry {
  company: string;
  role?: string;
  years?: number;
}

export interface CompletedModule {
  module: string;
  completedAt: string;
}

export interface FeePayment {
  _id: string;
  amount: number;
  term?: string;
  account?: string;
  paymentDate: string;
  notes?: string;
  recordedBy: { _id: string; firstName: string; lastName: string } | string;
  recordedAt: string;
}

export interface Student {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dob?: string;
  gender?: Gender;
  email: string;
  mobile: string;
  alternateMobile?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  highestQualification?: string;
  college?: string;
  university?: string;
  graduationYear?: number;
  percentage?: number;
  skills: string[];
  course: Course | string;
  batch?: Batch | string;
  joiningDate?: string;
  courseStartDate?: string;
  courseEndDate?: string;
  trainingStatus: TrainingStatus;
  completedModules: CompletedModule[];
  studentType: StudentType;
  lastCompany?: string;
  totalYearsExperience?: number;
  pfStatus?: boolean;
  workHistory: WorkHistoryEntry[];
  totalFees?: number;
  feePayments: FeePayment[];
  placementStatus: PlacementStatus;
  currentCompany?: string;
  jobTitle?: string;
  package?: number;
  placementDate?: string;
  notes: StudentNote[];
  createdAt: string;
}
