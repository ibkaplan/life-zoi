import { respond, type ConversationState, type MindReply } from "@/lib/mind/conversation";

/**
 * The seam where an AI model could later be added to LifeZoi Mind without rebuilding it.
 *
 * Today only the "rules" provider exists. It runs in the browser and sends nothing
 * anywhere. Any future model provider must:
 * - run the same safety check first and never be asked to handle a detected crisis;
 * - be called from a server route, with its key on the server only;
 * - be approved by the owner, with a disclosure shown to the person before any text is sent;
 * - pass its output through the same wording rules (no diagnosis, no medication advice);
 * - fail closed: when its free limit is reached, the person sees a clear message and the
 *   rules provider answers. It must never switch silently to a paid service.
 */

export type MindProviderId = "rules" | "cloudflare-workers-ai" | "webllm";

export type MindProviderInfo = {
  id: MindProviderId;
  label: string;
  status: "active" | "needs-approval" | "evaluated";
  runsWhere: string;
  sendsText: boolean;
  cost: string;
  notes: string;
};

export interface MindProvider {
  info: MindProviderInfo;
  respond(state: ConversationState, message: string): Promise<{ reply: MindReply; state: ConversationState }>;
}

export const RULES_PROVIDER: MindProvider = {
  info: {
    id: "rules",
    label: "LifeZoi written companion",
    status: "active",
    runsWhere: "In your browser",
    sendsText: false,
    cost: "Free. No service is called.",
    notes: "Replies are written in advance and chosen by rules. It recognizes common situations and asks one question at a time, but it does not understand language the way an AI model does.",
  },
  async respond(state, message) {
    return respond(state, message);
  },
};

/** Options that were researched (2026-11-22) and are not active. */
export const EVALUATED_PROVIDERS: readonly MindProviderInfo[] = [
  {
    id: "cloudflare-workers-ai",
    label: "Cloudflare Workers AI (open models such as Llama)",
    status: "needs-approval",
    runsWhere: "Cloudflare's servers",
    sendsText: true,
    cost: "Free allocation of 10,000 Neurons per day; requests fail with an error above it on the Free plan.",
    notes: "Cloudflare states it does not use customer content to train models and keeps it only as long as needed to provide the service. Recommended for owner approval, with a disclosure before use.",
  },
  {
    id: "webllm",
    label: "WebLLM (open model running inside the browser)",
    status: "evaluated",
    runsWhere: "On the person's own device",
    sendsText: false,
    cost: "Free. The model is downloaded once to the device.",
    notes: "Most private option, but it needs WebGPU, a large one-time download, and a capable device. Small models are less reliable on sensitive topics, so it is not recommended yet for older phones or for this use.",
  },
];

export const NOT_SUITABLE_NOTE =
  "Google's free Gemini tier was not chosen for LifeZoi Mind: its terms for unpaid services say Google may use what is sent to improve its products, that human reviewers may read it, and ask users not to send sensitive or personal information.";

export function activeProvider(): MindProvider {
  return RULES_PROVIDER;
}
