export type ModerationStatus = "approved" | "pending" | "rejected";

export type ModerationSource =
  | "local-filter"
  | "provider"
  | "not-configured"
  | "timeout"
  | "quota"
  | "error"
  | "admin";

export type ReportReason = "harassment" | "hate" | "spam" | "other";

export type PublicMessage = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  parentId: string | null;
};

export type OwnMessage = PublicMessage & {
  status: ModerationStatus;
  source: ModerationSource | string;
  notice: string;
  appealed: boolean;
};

export type QueueMessage = {
  id: string;
  authorName: string;
  body: string;
  status: "pending" | "rejected";
  category: string;
  source: string;
  createdAt: string;
  decidedAt: string;
  authorViolationCount: number;
  reportCount: number;
  appealed: boolean;
  restrictedUntil: string | null;
};

export type QueueReport = {
  id: string;
  messageId: string;
  authorName: string;
  body: string;
  reason: ReportReason;
  createdAt: string;
  reportCount: number;
  authorViolationCount: number;
};

export type AdminQueue = {
  pending: QueueMessage[];
  rejected: QueueMessage[];
  reports: QueueReport[];
};

export type CommunityBoard = {
  signedIn: boolean;
  isAdmin: boolean;
  moderation: "configured" | "not-configured";
  storage: "memory" | "account";
  privacyNotice: string;
  pendingNotice: string;
  rejectionNotice: string;
  retentionSummary: string;
  messages: PublicMessage[];
  mine: OwnMessage[];
  queue: AdminQueue | null;
};
