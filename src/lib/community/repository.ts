import type { ModerationStatus, ReportReason } from "@/lib/community/types";

export type StoredViolation = {
  at: string;
  category: string;
  messageId: string;
};

export type CommunityProfile = {
  userId: string;
  displayName: string;
  restrictedUntil: string | null;
  violations: StoredViolation[];
  providerCalls: string[];
};

export type StoredMessage = {
  id: string;
  authorId: string;
  authorName: string;
  parentId: string | null;
  body: string;
  redacted: boolean;
  status: ModerationStatus;
  category: string;
  source: string;
  contentHash: string;
  clientRequestId: string | null;
  createdAt: string;
  decidedAt: string;
  removedAt: string | null;
  appealUsed: boolean;
  violationCounted: boolean;
};

export type StoredReport = {
  id: string;
  messageId: string;
  reporterId: string;
  reason: ReportReason;
  createdAt: string;
  status: "open" | "dismissed";
  resolvedAt: string | null;
};

export type StoredRelation = {
  ownerId: string;
  otherId: string;
  createdAt: string;
};

export type CommunityRepository = {
  runExclusive<T>(task: () => Promise<T>): Promise<T>;
  getProfile(userId: string): Promise<CommunityProfile | null>;
  saveProfile(profile: CommunityProfile): Promise<void>;
  listProfiles(): Promise<CommunityProfile[]>;
  getMessage(id: string): Promise<StoredMessage | null>;
  listMessages(): Promise<StoredMessage[]>;
  insertMessage(message: StoredMessage): Promise<void>;
  updateMessage(message: StoredMessage): Promise<void>;
  deleteMessage(id: string): Promise<void>;
  listReports(): Promise<StoredReport[]>;
  insertReport(report: StoredReport): Promise<void>;
  updateReport(report: StoredReport): Promise<void>;
  deleteReport(id: string): Promise<void>;
  listBlocks(): Promise<StoredRelation[]>;
  addBlock(relation: StoredRelation): Promise<void>;
  listMutes(): Promise<StoredRelation[]>;
  addMute(relation: StoredRelation): Promise<void>;
};

export function createMutex() {
  let tail: Promise<void> = Promise.resolve();
  return function runExclusive<T>(task: () => Promise<T>): Promise<T> {
    const run = tail.then(task, task);
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };
}

function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createMemoryRepository(): CommunityRepository {
  const profiles = new Map<string, CommunityProfile>();
  const messages = new Map<string, StoredMessage>();
  const reports = new Map<string, StoredReport>();
  const blocks: StoredRelation[] = [];
  const mutes: StoredRelation[] = [];
  const runExclusive = createMutex();

  return {
    runExclusive,
    async getProfile(userId) {
      const profile = profiles.get(userId);
      return profile ? copy(profile) : null;
    },
    async saveProfile(profile) {
      profiles.set(profile.userId, copy(profile));
    },
    async listProfiles() {
      return [...profiles.values()].map(copy);
    },
    async getMessage(id) {
      const message = messages.get(id);
      return message ? copy(message) : null;
    },
    async listMessages() {
      return [...messages.values()].map(copy);
    },
    async insertMessage(message) {
      messages.set(message.id, copy(message));
    },
    async updateMessage(message) {
      messages.set(message.id, copy(message));
    },
    async deleteMessage(id) {
      messages.delete(id);
    },
    async listReports() {
      return [...reports.values()].map(copy);
    },
    async insertReport(report) {
      reports.set(report.id, copy(report));
    },
    async updateReport(report) {
      reports.set(report.id, copy(report));
    },
    async deleteReport(id) {
      reports.delete(id);
    },
    async listBlocks() {
      return blocks.map(copy);
    },
    async addBlock(relation) {
      if (!blocks.some((item) => item.ownerId === relation.ownerId && item.otherId === relation.otherId)) {
        blocks.push(copy(relation));
      }
    },
    async listMutes() {
      return mutes.map(copy);
    },
    async addMute(relation) {
      if (!mutes.some((item) => item.ownerId === relation.ownerId && item.otherId === relation.otherId)) {
        mutes.push(copy(relation));
      }
    },
  };
}
