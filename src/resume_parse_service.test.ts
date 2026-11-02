import assert from "node:assert/strict";
import { accountDecision } from "./resume_parse_service.ts";

assert.equal(accountDecision("candidate-001", false), "onboard");
assert.equal(accountDecision("candidate-001", true), "active");
console.log("account lifecycle decision passed");
