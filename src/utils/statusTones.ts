type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral' | 'cyan';

export const COURSE_STATUS_TONE: Record<string, Tone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
};

export const BATCH_STATUS_TONE: Record<string, Tone> = {
  UPCOMING: 'cyan',
  ACTIVE: 'success',
  COMPLETED: 'neutral',
  CANCELLED: 'danger',
};

export const TRAINING_STATUS_TONE: Record<string, Tone> = {
  ENROLLED: 'cyan',
  ACTIVE: 'success',
  COMPLETED: 'brand',
  DROPPED: 'danger',
  ON_HOLD: 'warning',
};

export const PLACEMENT_STATUS_TONE: Record<string, Tone> = {
  NOT_LOOKING: 'neutral',
  LOOKING_FOR_JOB: 'warning',
  INTERVIEWING: 'cyan',
  PLACED: 'success',
  NOT_PLACED: 'danger',
};

export const USER_STATUS_TONE: Record<string, Tone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  SUSPENDED: 'danger',
};

export const ENQUIRY_STATUS_TONE: Record<string, Tone> = {
  NEW: 'cyan',
  CONTACTED: 'brand',
  FOLLOW_UP: 'warning',
  INTERESTED: 'brand',
  NOT_INTERESTED: 'neutral',
  CONVERTED: 'success',
  LOST: 'danger',
};

export const ENQUIRY_SOURCE_TONE: Record<string, Tone> = {
  WEBSITE: 'cyan',
  WALK_IN: 'brand',
  PHONE: 'warning',
  REFERRAL: 'success',
  SOCIAL_MEDIA: 'neutral',
  OTHER: 'neutral',
};

export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}
