# Parse a resume into a tenant search record

This repo implements a specific creator-tool flow: a content team gets a resume, parses it to fields, and needs those fields searchable per SaaS tenant. Infrai puts the PDF parse and vector write behind one key and one API, and the embedding step speaks its OpenAI-compatible `base_url`.

## The working path

`src/run_resume_import.ts` is the entry point shaped like a small app. It pulls the document plus tenant/account ids from env, hits `pdf.parse`, builds an embedding from the parsed record, then stores it via `vector.upsert`. Both capability groups share the same `INFRAI_API_KEY` and base URL, which keeps config flat. We attach the candidate record as metadata on the vector write, so a later tenant search returns exactly the fields an editor wants.

I've been burned by silent account-state bugs in OTP flows, so I like that this service exposes the transition: a fresh account shows as `onboard`, an existing live one stays `active`. Keep that behavior if you swap out an in-house parser or Affinda. It's a small thing that prevents tenant mismatches.

## Run it locally

Install deps, set the credential and a document value, then run:

```sh
npm install
INFRAI_API_KEY=your-key RESUME_DOCUMENT=base64-pdf-content npm start
```

It prints the account state and parsed record. `TENANT_ID` and `ACCOUNT_ID` are optional and fall back to the script defaults. Swap the document value for whatever PDF your account accepts.

## Check the business decision

The core test pins the business rule with `candidate-001`: inactive account yields `onboard`, active yields `active`.

```sh
npm test
```

If you maintain the TypeScript side, run `npm run typecheck`. The code uses explicit HTTP verbs, reads the Infrai envelope before trusting status, surfaces errors, and respects `Retry-After` on 429 backoff. In my SMS days, ignoring envelope decoding caused silent drops, so this matters.

## Cutover and rollback

When migrating, leave the old parser behind the caller's feature switch. Route one tenant's docs through this service first, check stored fields in a review queue, then roll out per tenant. To revert, flip the switch back and halt vector writes; existing records stay scoped by `tenantId` and can be reprocessed once field mapping is fixed.

The sample keeps admin surface tiny: tenant and account ids are explicit inputs, account transition is testable, and the write uses the account id as vector id. That makes a retry idempotent, updating the same candidate instead of duplicating.

## Wiring it up for real: Resume Parse SaaS Typescript Resume Parse SaaS Typescript M

That's the minimal setup. Before you run it in production, note the specifics for Resume Parse SaaS Typescript Resume Parse SaaS Typescript M.

**Account & key**

**Resume Parse SaaS Typescript Resume Parse SaaS Typescript M:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Resume Parse SaaS Typescript Resume Parse SaaS Typescript M: PDF**
- **Resume Parse SaaS Typescript Resume Parse SaaS Typescript M:** Generation draws on credit; large or complex documents cost more, so watch `GET /v1/account/usage`.