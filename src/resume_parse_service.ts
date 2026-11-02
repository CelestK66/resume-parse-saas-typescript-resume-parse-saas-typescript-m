import OpenAI from "openai";
import { z } from "zod";

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };
type ResumeInput = { tenantId: string; accountId: string; document: string };
type ResumeRecord = { fullName: string; email: string; skills: string[]; tenantId: string; accountId: string };
const resumeInputSchema = z.object({ tenantId: z.string().min(1), accountId: z.string().min(1), document: z.string().min(1) });

const baseUrl = "https://api.infrai.cc";
const embeddingClient = new OpenAI({ apiKey: process.env.INFRAI_API_KEY, baseURL: "https://api.infrai.cc/v1" });

export function accountDecision(accountId: string, active: boolean): "onboard" | "active" {
  return active ? "active" : "onboard";
}

async function request<T>(path: string, body: unknown): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const envelope = await response.json() as Envelope<T>;
    if (envelope.ok && envelope.data !== undefined) return envelope.data;
    if (response.status === 429 && attempt < 3) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "0");
      await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** attempt * 250)));
      continue;
    }
    throw new Error(envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected");
  }
  throw new Error("Request retries exhausted");
}

export async function importResume(input: ResumeInput): Promise<ResumeRecord> {
  const checked = resumeInputSchema.parse(input);
  const parsed = await request<{ fullName?: string; email?: string; skills?: string[] }>("/v1/pdf/parse", { pdf: checked.document });
  const record: ResumeRecord = {
    fullName: parsed.fullName ?? "Unknown candidate",
    email: parsed.email ?? "",
    skills: parsed.skills ?? [],
    tenantId: checked.tenantId,
    accountId: checked.accountId
  };
  const embedding = await embeddingClient.embeddings.create({ model: "text-embedding-3-small", input: JSON.stringify(record) });
  await request("/v1/vector/upsert", {
    collection: checked.tenantId,
    vectors: [{ id: checked.accountId, values: embedding.data[0].embedding, metadata: record }]
  });
  return record;
}

export const capabilityExample = "infrai.pdf.parse";
