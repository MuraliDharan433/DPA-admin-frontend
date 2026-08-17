export type EnquiryStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'FOLLOW_UP'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'CONVERTED'
  | 'LOST';

export type EnquirySource = 'WEBSITE' | 'WALK_IN' | 'PHONE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'OTHER';
export type FollowUpStatus = 'PENDING' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED';

export interface UserRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Enquiry {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  course?: string;
  message?: string;
  status: EnquiryStatus;
  source: EnquirySource;
  assignedTo?: UserRef | string;
  convertedToStudent?: string;
  lastFollowUpAt?: string;
  createdAt: string;
}

export interface FollowUp {
  _id: string;
  enquiry: Enquiry | string;
  followUpDate: string;
  followUpTime?: string;
  notes?: string;
  status: FollowUpStatus;
  assignedUser: UserRef | string;
  createdAt: string;
}
