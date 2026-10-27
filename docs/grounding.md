# Grounding Protocol: Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](foundation.md)
**Related:** [Evidence registers](evidence.md) · [ADR index](adr/README.md) · [Glossary](glossary.md) · [Index](index.md)

---

> **Why this exists.** An AI agent fabricates when the context it needs is missing and the cheapest-looking answer is a confident guess. This document makes **"I don't know — here is what I checked"** the cheapest correct answer. It applies to every AI agent and every human contributor.
>
> **This document is the canonical home of the status vocabulary (§3).** Other documents reference it; they do not redefine it.

---

## 1. Evidence Hierarchy

When sources disagree, the higher one wins **for the kind of fact it covers**. Model memory is never sufficient on its own.

| Rank | Source | Wins for |
|---:|---|---|
| 1 | Live introspection or a command run this session (tests, linters, schema dump, `--version`, HTTP call) | What is true **right now** |
| 2 | Code, lockfiles, migrations, generated types in the repository | **As-built** facts: what exists, which version, which behavior |
| 3 | [`foundation.md`](foundation.md) and accepted [ADRs](adr/README.md) | **Product intent** and decided matters |
| 4 | Other `docs/` files | Derived summaries — if they disagree with rank 2 or 3, they are stale |
| 5 | A statement by the user in the current conversation | Intent for this task — **record it** in [`evidence.md`](evidence.md) or an ADR if it is a durable fact |
| 6 | Official, **versioned** vendor documentation fetched now | External behavior for the pinned version |
| 7 | Model memory / general knowledge | Nothing citable. Use only to decide *where to look* |

**Conflict rule.** As-built disagreement: code wins, then fix the doc in the same change. Product-intent disagreement: `foundation.md` or the accepted ADR wins, then fix the code or open a decision. Never silently choose one and move on — report the drift.

---

## 2. Claim Classes and Required Evidence

| Claim class | Examples | Required evidence | If evidence is missing, write |
|---|---|---|---|
| Product fact | Who the users are, what the product does | `foundation.md` § or ADR | `TBD` or `Not stated` |
| Capability status | "Feature X works" | Code path + a test or command run | `⬜` / `🟡`, never `✅` |
| Technical fact | File path, function, env var, endpoint, table, flag | Open the file or run the command | `Not found in repo` |
| Dependency behavior | Library API, option, default | Lockfile version + versioned docs or the package's own types | `Unverified for [version]` |
| Number | Market size, price, latency, savings, user count | A row in the claims ledger ([`evidence.md`](evidence.md) §3) with source and date | `Not validated` |
| Named entity | Company, agency, partner, customer | Entity register ([`evidence.md`](evidence.md) §6) | `Prospective target` |
| Regulatory / legal | "Compliant with…", "exempt from…" | Named review with reviewer and date | `Review outstanding` |
| Comparison | "Better than…", "unlike…" | Named competitor, criteria, dated source | `Positioning, not validated` |
| Citation / URL | Links, quotes, paper titles | Open it and confirm it says that | Omit it |

---

## 3. Canonical Status Vocabulary

Use these exact marks everywhere. Do not invent variants.

**Implementation status** (features, requirements, components)

| Mark | Meaning |
|---|---|
| ✅ | Built and wired end-to-end, **and verified** (test or command named) |
| 🟡 | Partial, mocked, simulated, or built-but-gated — say which |
| ⬜ | Planned. No implementation in code |
| ❌ | Out of scope for the current version |

**Evidence status** (claims, numbers, entities, decisions)

| Label | Meaning |
|---|---|
| **Validated** | Source and date recorded in [`evidence.md`](evidence.md) |
| **Not validated** | Stated, but no verifiable source yet |
| **TBD** | Genuinely undecided. Do not fill it in |
| **Not stated** | The source material is silent |
| **Assumed** | Working assumption with an `A-NN` entry |

**Work-item status** (sprint stories)

| Mark | Meaning |
|---|---|
| ⬜ To Do · 🔄 In Progress · 🟡 Partial · ✅ Done | As named |
| ⛔ Blocked | Cannot proceed; reason recorded. (`❌` is never used for Blocked.) |

**Issue status** (known issues, defects): `⚠️ Open` · `✅ Resolved [DATE]`

---

## 4. Hard Prohibitions

An agent must **never**:

1. Invent a number, percentage, date, price, benchmark, user count, or savings figure.
2. Invent or imply a partner, customer, endorsement, pilot, or agreement. Entities are **prospective targets** until a signed agreement exists.
3. Cite a file path, function, table, env var, endpoint, CLI flag, or package name it has not opened or searched for.
4. Use a library API from memory when the version is pinned. Read the versioned docs or the installed package's types first.
5. Say "tests pass", "it works", or "verified" without having run the command and seen the output.
6. Describe planned, gated, simulated, or mocked behavior as built.
7. Describe the project as compliant, certified, exempt, secure, or production-ready.
8. Fill a `TBD`, `Open`, or `Not stated` slot with a plausible answer.
9. Fabricate a URL, citation, quote, or reference.
10. Widen scope silently (extra features, refactors, dependency swaps) beyond the plan the user confirmed.
11. Weaken a test, validation, or invariant to make something pass.
12. Resolve a conflict between sources by picking the convenient one without reporting it.

---

## 5. Required Behaviors

### 5.1 Pre-flight (before any task)

- [ ] Read [`foundation.md`](foundation.md), then the documents the task touches, in the order listed in [`index.md`](index.md).
- [ ] Check [ADRs](adr/README.md) — if the matter is already decided, follow it.
- [ ] Check [`evidence.md`](evidence.md) for existing claims, assumptions, and pinned versions.
- [ ] Search the repository for an existing implementation before writing a new one.
- [ ] List every fact the task depends on and where each was verified. Anything unverified becomes an **assumption** to state or a **question** to ask.

### 5.2 During

- Cite `path:line` or `doc §` for every non-obvious claim.
- Label reasoning that is not confirmed as **Inferred**.
- Use canonical terms from [`glossary.md`](glossary.md) in code identifiers, UI copy, and docs.

### 5.3 Post-flight (before reporting done)

- [ ] Run the project's validation commands ([`build.md`](build.md) §6) and report **actual** results.
- [ ] Update status docs ([`flow.md`](flow.md), sprint story block, affected registers) in the same change.
- [ ] Re-read the diff for any number, name, or capability not backed by evidence.
- [ ] Send the report in the format of §8.

---

## 6. Stop-and-Ask Triggers

Stop and ask the user (use `/grill-me` if available) instead of proceeding when:

| Trigger | Example |
|---|---|
| A product fact is undecided | The answer is `TBD` in [`foundation.md`](foundation.md) §14 |
| Sources conflict and the hierarchy doesn't resolve it | Foundation and an ADR disagree |
| Required context is absent | No credentials, env, spec, or acceptance criteria |
| The action is destructive or irreversible | Data deletion, force-push, production migration |
| Money, identity, security, or legal impact | Anything touching [`security.md`](security.md) boundaries |
| The request contradicts an ADR or `AGENTS.md` | "Skip the review gate just this once" |
| You cannot name the evidence for a step you are about to take | — |

Asking costs one message. A fabricated fact costs a rewrite and, if quoted externally, credibility.

---

## 7. Confidence Labels (use in reports)

| Label | Meaning |
|---|---|
| **Verified** | I read it or ran it **this session**; evidence cited |
| **Documented** | A doc says so; not re-verified against code |
| **Inferred** | Reasoned from verified facts; not confirmed |
| **Assumed** | Recorded as `A-NN` in [`evidence.md`](evidence.md) |
| **Unknown** | Could not determine — state what was checked |

---

## 8. Task Report Format

```
Changed: <files and what>
Verified: <fact> — <command or path:line>
Documented-only: <fact> — <doc §>   (not re-verified)
Inferred / Assumed: <item> — <A-NN or reasoning>
Not verified / Unknown: <item> — <what was checked, what is needed>
Doc drift found: <doc §> says X, code shows Y
Validation run: <command> → <actual result>
Open questions: <list>
```

---

## 9. Red-Flag Phrases

If a draft contains these without a citation, stop and find evidence or remove the sentence:

`typically` · `usually` · `as is standard` · `industry standard` · `best practice` · `I believe` · `should work` · `probably` · `leading` · `seamless` · `up to N%` · any round-number statistic · any "X is used by…" · any "supports…" about a third-party tool

---

## 10. Stale and Drifted Documents

- If code and a document disagree, **report it**, fix the document in the same change, and log the drift in [`build.md`](build.md) §8 if it cannot be fixed now.
- Never "fix" code to match a stale document without confirming the document is the intended truth (see conflict rule, §1).
- A claim in a register ([`evidence.md`](evidence.md)) older than its **re-verify by** date is treated as **Not validated** until refreshed.

---

## Self-Check

- [ ] Every document in the suite references this one in its callout
- [ ] No document redefines the status vocabulary
- [ ] Every number in the suite has a claims-ledger row or is marked `Not validated` / `TBD`
- [ ] Every named entity is in the entity register as a prospective target or with a dated agreement
- [ ] Pinned dependency versions in [`evidence.md`](evidence.md) §5 match the lockfile
