export type WellnessRole = "user" | "assistant";

export type WellnessTurn = {
  role: WellnessRole;
  content: string;
};

export type WellnessModelRequest = {
  messages: WellnessTurn[];
  maxOutputTokens: number;
  /** The visitor's interface language. The reply is written in it. English when left out. */
  language?: "en" | "uk" | "ru" | "el";
};

export type WellnessModelSuccess = {
  ok: true;
  text: string;
  providerId: string;
  model: string;
};

export type WellnessModelFailure = {
  ok: false;
  reason: "not-configured" | "quota" | "unavailable";
  message: string;
};

export type WellnessModelResult = WellnessModelSuccess | WellnessModelFailure;

export interface WellnessModelProvider {
  id: string;
  model: string;
  complete(request: WellnessModelRequest): Promise<WellnessModelResult>;
}

export type PreparedPointer = {
  id: string;
  question: string;
};

export type WellnessUsageSnapshot = {
  sessionUsed: number;
  sessionDailyLimit: number;
  processUsed: number;
  processDailyLimit: number;
};

export type WellnessSource = "model" | "prepared" | "quota" | "unavailable" | "safety" | "withheld";

export type WellnessChatBody = {
  source: WellnessSource;
  configured: boolean;
  provider: string | null;
  model: string | null;
  reply: string;
  notice: string | null;
  suggestion: string | null;
  preparedQuestionId: string | null;
  related: PreparedPointer[];
  personalDataIgnored: boolean;
  usage: WellnessUsageSnapshot | null;
  error: string | null;
};
