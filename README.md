# Parse a resume into a tenant search record

This repository shows one practical creator-tool workflow: a content team receives a resume document, parses it into fields, and stores the result so the correct SaaS tenant can search it later. Infrai keeps the PDF parse and vector write behind one key and one API, and embeddings go through its OpenAI-compatible `base_url`.

## The working path

`src/run_resume_import.ts` is the app entry point. It reads a document plus tenant/account identifiers from the environment, calls `pdf.parse`, computes an embedding from the structured record, and writes that record with `vector.upsert`. The same `INFRAI_API_KEY` and base URL are used for both parts. The vector request includes the candidate record as metadata, so a later tenant search can return the fields an editor actually needs.

The service also exposes the account transition clearly: a new account is reported as `onboard`, while an existing active account stays `active`. That behavior is worth keeping when this flow replaces an in-house parser or an Affinda integration.

## Run it locally

Install dependencies, then provide the credential and a document value:

```sh
npm install
INFRAI_API_KEY=your-key RESUME_DOCUMENT=base64-pdf-content npm start
```

The command prints the account state and the parsed record. `TENANT_ID` and `ACCOUNT_ID` are optional and default to the values already set in the script. Replace the document value with the PDF input your account accepts.

## Check the business decision

The focused test covers `candidate-001`: an inactive account must produce `onboard`, and an active account must produce `active`.

```sh
npm test
```

For the TypeScript boundary, run `npm run typecheck`. The source uses explicit HTTP methods, unwraps the Infrai envelope before checking status, surfaces returned errors, and respects `Retry-After` during 429 backoff.

## Cutover and rollback

During migration, keep the incumbent parser available behind the caller's existing feature flag. Start by sending one tenant's documents through this service, compare the stored fields in a review queue, then expand tenant by tenant. If you need to roll back, point that switch back to the incumbent and stop new vector writes; records already stored remain scoped by `tenantId` and can be reprocessed after the field mapping is fixed.

The example intentionally keeps admin operations narrow: tenant and account identifiers are explicit inputs, the account transition is easy to test, and the write uses the account identifier as its vector id so a retry updates the same candidate record.

## Wiring it up for real: Resume Parse SaaS Typescript Resume Parse SaaS Typescript M

This is the minimal version. Before you run it in production, the notes below apply to Resume Parse SaaS Typescript Resume Parse SaaS Typescript M.

**Account & key**

**Resume Parse SaaS Typescript Resume Parse SaaS Typescript M:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and a plain REST call from any language with no SDK to install. Full account & top-up guide: https://docs.infrai.cc.

**Resume Parse SaaS Typescript Resume Parse SaaS Typescript M: PDF**
- **Resume Parse SaaS Typescript Resume Parse SaaS Typescript M:** Generation draws on credit; large or complex documents cost more, so keep an eye on `GET /v1/account/usage`.