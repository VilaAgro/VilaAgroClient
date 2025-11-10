// src/app/core/models/attendance.model.ts

export type AbsenceType = 'REGISTERED' | 'NOTIFIED';

export interface JustificationDTO {
  id: string;
  description: string;
  hasAnnex: boolean;
  isApproved: boolean | null;
  approvedByAdminId: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface AbsenceDTO {
  id: string;
  userId: string;
  userName: string;
  date: string;
  type: AbsenceType;
  isAccepted: boolean;
  justification: JustificationDTO | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummaryDTO {
  totalAbsences: number;
  justifiedAbsences: number;
  pendingJustifications: number;
  unjustifiedAbsences: number;
  consecutiveAbsences: number;
  isCompliant: boolean;
}

export interface RegisterAbsencesRequest {
  date: string;
  userIds: string[];
}

export interface ReviewJustificationRequest {
  isApproved: boolean;
  reason?: string;
}

export interface NotifyAbsenceRequest {
  date: string;
  reason: string;
  file?: File;
}
