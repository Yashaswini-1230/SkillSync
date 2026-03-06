const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

function randomInt(min, max) {
  return crypto.randomInt(min, max + 1);
}

function sampleUnique(arr, count) {
  const copy = [...arr];
  const out = [];
  const n = Math.min(count, copy.length);
  for (let i = 0; i < n; i++) {
    const idx = randomInt(0, copy.length - 1);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function inferTrack(roleLower) {
  if (/(front\s*end|frontend|ui|react|angular|vue)/.test(roleLower)) return 'frontend';
  if (/(back\s*end|backend|api|server|node|java|spring|dotnet)/.test(roleLower)) return 'backend';
  if (/(data|analyst|analytics|bi|scientist|ml|machine learning|ai)/.test(roleLower)) return 'data';
  if (/(devops|sre|site reliability|platform|cloud|infra)/.test(roleLower)) return 'devops';
  if (/(qa|test|automation|sdet)/.test(roleLower)) return 'qa';
  if (/(product|pm|product manager)/.test(roleLower)) return 'product';
  return 'general';
}

// Role-only, real-world questions (no resume parsing; always varied)
function generateRoleBasedInterviewQuestions(role) {
  const roleLabel = String(role || '').trim();
  const roleLower = roleLabel.toLowerCase();
  const track = inferTrack(roleLower);

  const baseContexts = [
    'a production incident',
    'a tight deadline with ambiguous requirements',
    'a performance regression after a release',
    'a difficult trade-off between quality and speed',
    'a cross-team dependency that blocked delivery',
    'a customer-reported bug with limited repro steps'
  ];

  const technicalPools = {
    frontend: [
      `Walk me through how you would diagnose and fix a slow ${roleLabel} screen (rendering jank, large bundles, or expensive state updates).`,
      `How would you design a reusable component API for a design system used by multiple teams? Give examples of prop design and accessibility constraints.`,
      `Describe a time you had to debug a tricky state-management issue (stale closures, race conditions, or double renders). How did you isolate the root cause?`,
      `In a real app, how do you handle error states, loading states, and retries for a critical user flow?`,
      `How would you implement client-side performance monitoring and what signals would you alert on?`
    ],
    backend: [
      `Design a REST API for a high-traffic feature. How do you handle pagination, idempotency, rate limiting, and backward compatibility?`,
      `You’re on-call and latency spikes after a deploy. As a ${roleLabel}, what steps do you take in the first 30 minutes?`,
      `How would you choose between caching, query optimization, and data denormalization for a slow endpoint?`,
      `Explain a real-world approach to securing an API (authn/authz, secrets, input validation, audit logs).`,
      `How do you design a service to be resilient to downstream failures (timeouts, retries, circuit breakers)?`
    ],
    data: [
      `A stakeholder asks for a metric that can be gamed. How do you define a robust metric and validate it with data?`,
      `Describe how you would design a data pipeline that is reliable and debuggable (backfills, schema drift, and monitoring).`,
      `How do you detect and investigate data quality issues in a dashboard that execs use weekly?`,
      `Walk through how you would evaluate a model or analysis for bias/leakage and communicate limitations to non-technical stakeholders.`,
      `How do you decide between SQL, Python notebooks, and BI tooling for a given analysis?`
    ],
    devops: [
      `You inherit a flaky CI/CD pipeline. What’s your approach to stabilizing it without slowing teams down?`,
      `How would you implement observability for a critical service (logs, metrics, traces) and define SLOs?`,
      `Walk through a realistic incident response for an outage: triage, comms, mitigation, and postmortem actions.`,
      `How do you manage infrastructure changes safely (terraform planning, approvals, rollbacks, blast radius)?`,
      `What’s your strategy for cost optimization in cloud without compromising reliability?`
    ],
    qa: [
      `A release is next week and coverage is weak. How do you prioritize tests and risk areas as a ${roleLabel}?`,
      `Describe how you’d design an automation strategy that balances UI, API, and unit-level tests.`,
      `How do you handle flaky tests in CI so teams trust the pipeline again?`,
      `Tell me about a time you found a root cause that wasn’t obvious from the bug report. What was your debugging process?`,
      `How do you write test cases that catch edge cases without becoming unmaintainable?`
    ],
    product: [
      `A key feature is slipping. How do you re-scope, communicate trade-offs, and keep stakeholders aligned?`,
      `Describe how you would write a PRD for a complex feature with ambiguous requirements and multiple teams involved.`,
      `How do you decide what to measure for success and set up an experiment that is trustworthy?`,
      `Tell me about a time you had to say “no” to a stakeholder request. How did you handle it?`,
      `How do you make decisions when data is incomplete or noisy?`
    ],
    general: [
      `Describe a real debugging story: what signals did you look at, what hypotheses did you test, and what fixed it?`,
      `How do you make trade-offs between correctness, performance, and delivery speed on a real project?`,
      `Walk through how you estimate work when requirements are changing and dependencies are unclear.`,
      `How do you ensure what you ship is maintainable 6 months later?`,
      `Tell me about a time you improved a process or system that helped the team move faster.`
    ]
  };

  const behavioralPool = [
    `Tell me about a time you took ownership of a problem that wasn’t clearly assigned. What did you do and what changed?`,
    `Describe a time you disagreed with a technical direction. How did you influence the decision?`,
    `Tell me about a time you had to communicate bad news (slip, outage, or quality issue) to stakeholders. What did you say?`,
    `Describe a time you made a mistake in production. How did you respond, and what did you improve afterward?`,
    `Give an example of how you prioritize when everything feels urgent. What framework do you use?`,
    `Tell me about a time you mentored someone or raised the bar for the team. What was your approach?`
  ];

  const scenarioPool = baseContexts.map(
    (ctx) =>
      `Scenario: You’re in ${ctx}. As a ${roleLabel}, what do you do first, what do you do next, and what do you explicitly NOT do?`
  );

  const targetCount = randomInt(5, 10);
  const minTechnical = Math.min(5, Math.max(3, Math.floor(targetCount * 0.6)));
  const minBehavioral = Math.max(2, targetCount - minTechnical - 1);

  const technical = sampleUnique(technicalPools[track] || technicalPools.general, minTechnical).map((q) => ({
    type: 'technical',
    question: q
  }));
  const behavioral = sampleUnique(behavioralPool, minBehavioral).map((q) => ({
    type: 'behavioral',
    question: q
  }));
  const remaining = targetCount - technical.length - behavioral.length;
  const scenario = sampleUnique(scenarioPool, Math.max(0, remaining)).map((q) => ({
    type: 'scenario',
    question: q
  }));

  const all = [...technical, ...behavioral, ...scenario];
  // Shuffle for variety
  for (let i = all.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, targetCount);
}

// @route   POST /api/interview/generate
// @desc    Generate interview questions
// @access  Private
router.post('/generate', auth, [
  body('role').notEmpty().withMessage('Role is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;

    // Generate questions using ONLY the role (no resume lookup)
    const questions = generateRoleBasedInterviewQuestions(role);

    res.json({
      message: 'Interview questions generated successfully',
      questions
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({ message: 'Error generating interview questions' });
  }
});

module.exports = router;
