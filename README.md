# GenAI — Two voices. Your preference.

Ask anything. Get two answers side by side — one from Kyle, one from Kylie, two AI personas with distinct communication styles. Which one you pick, over enough questions, builds into a report on how you actually prefer to communicate.

*Screenshot*

## The question behind it

A lot of consulting work is reading a room — figuring out whether a stakeholder wants the direct version or the softened version of the same answer. I got curious whether that same split shows up when the messenger is an AI instead of a person, and whether people's reactions to a "masculine" vs. "feminine" communication style say more about the style or about them.

It's not trying to prove anything about gender and AI in some grand sense. It's a small, honest instrument: ask it things, see which voice you keep choosing, and see if the pattern surprises you.

## How it works

1. Sign in, ask anything — career questions, relationship stuff, decisions you're stuck on
2. Kyle and Kylie each answer in their own voice; you pick the one that resonates
3. After enough picks, it generates a behavioral report on your communication preferences

## What's in it

- Dual-persona chat — every prompt gets two parallel Claude responses with different style profiles
- Model picker — Haiku, Sonnet, or Opus per conversation
- Multi-chat sidebar with pin and delete
- Communication-style reports built from your actual choice history, not a static quiz
- Accounts and saved conversations via Supabase

## Stack

Next.js 16 (App Router), React 19, TypeScript. Claude via the Anthropic SDK with Zod-validated structured outputs. Supabase for auth and storage. Tailwind 4. Deployed on Vercel.

## The part that was actually hard

Not the two-persona idea — the plumbing under it. Streaming two separate model responses back at once without one blocking the other, validating structured output from an LLM well enough that a malformed response doesn't just crash the report generator, and getting auth-scoped data right in Supabase so one user's chat history can't leak into another's.

## Running it locally

```bash
npm install
npm run dev
```

Needs `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`. Supabase migrations live in `supabase/migrations`.
