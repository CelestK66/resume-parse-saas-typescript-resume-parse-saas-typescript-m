import { importResume, accountDecision } from "./resume_parse_service.ts";

const input = {
  tenantId: process.env.TENANT_ID ?? "creator-tools-demo",
  accountId: process.env.ACCOUNT_ID ?? "candidate-001",
  document: process.env.RESUME_DOCUMENT ?? "base64-pdf-content"
};

const record = await importResume(input);
console.log(JSON.stringify({ account: accountDecision(input.accountId, false), record }, null, 2));
