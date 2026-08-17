import type { Student } from './academic.types';
import type { UserRef } from './enquiry.types';

export type JobApplicationStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED'
  | 'OFFER_RECEIVED'
  | 'JOINED';

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED' | 'NO_SHOW';
export type InterviewResult = 'PENDING' | 'SELECTED' | 'REJECTED';

export interface Company {
  _id: string;
  name: string;
  website?: string;
  industry?: string;
  location?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  createdAt: string;
}

export interface JobApplication {
  _id: string;
  student: Student | string;
  company: Company | string;
  jobTitle: string;
  package?: number;
  applicationDate: string;
  status: JobApplicationStatus;
  offerDate?: string;
  joiningDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Interview {
  _id: string;
  application: JobApplication | string;
  student: Student | string;
  interviewDate: string;
  round?: string;
  status: InterviewStatus;
  result: InterviewResult;
  interviewer?: string;
  feedback?: string;
  createdAt: string;
}

export interface Resume {
  _id: string;
  student: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  version: number;
  isActive: boolean;
  uploadedBy: UserRef | string;
  createdAt: string;
}

export type MockSessionType = 'MOCK_INTERVIEW' | 'MOCK_TEST';

export interface MockSession {
  _id: string;
  student: Student | string;
  type: MockSessionType;
  date: string;
  trainer: UserRef | string;
  feedback?: string;
  rating: number;
  createdAt: string;
}
