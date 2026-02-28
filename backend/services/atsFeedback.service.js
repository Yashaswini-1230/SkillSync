const axios = require('axios');

function buildFallbackFeedback(input) {
  const missing = (input.missing_skills || []).slice(0, 15);
  const expGap = input.experience_gap || 0;

  const parts = [];
  parts.push(
    `Overall: Semantic alignment is ${input.semantic_score}/100 and skill match is ${input.skill_match_percentage}/100.`
  );
  if (missing.length) {
    parts.push(
      `Missing skills to consider adding (only if you genuinely have them): ${missing.join(', ')}.`
    );
  } else {
    parts.push('Skills coverage looks strong versus the job description.');
  }
  if (expGap > 0) {
    parts.push(
      `Experience gap: the JD indicates ${input.required_years} years; your resume indicates ${input.candidate_years} years. If applicable, clarify total years and relevant scope.`
    );
  }
  if (input.section_score < 100) {
    parts.push(
      `Resume structure: your section completeness score is ${input.section_score}/100. Add standard headings for missing sections (Skills, Experience, Projects, Education).`
    );
  }
  parts.push(
    'Improve wording: lead bullets with strong action verbs, add measurable outcomes, and mirror the JD terminology naturally (without keyword stuffing).'
  );
  return parts.join('\n\n');
}

async function generateAtsFeedback({
  semantic_score,
  skill_match_percentage,
  missing_skills,
  experience_gap,
  section_score,
  candidate_years,
  required_years
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL;

  const input = {
    semantic_score,
    skill_match_percentage,
    missing_skills,
    experience_gap,
    section_score,
    candidate_years,
    required_years
  };

  if (!apiKey || !model) {
    return buildFallbackFeedback(input);
  }

  const system = [
    'You are an ATS resume coach.',
    'You must NOT calculate or change any scores.',
    'Use ONLY the provided numeric scores and lists.',
    'Return a single plain-text response (no JSON).',
    'Be specific, practical, and role-agnostic (no guessing role).'
  ].join(' ');

  const user = `Input JSON:\n${JSON.stringify(
    {
      semantic_score,
      skill_match_percentage,
      missing_skills,
      experience_gap,
      section_score,
      candidate_years,
      required_years
    },
    null,
    2
  )}\n\nWrite feedback covering:\n- Missing skills explanation\n- Resume improvement suggestions\n- Grammar & wording improvements\n- Section recommendations\n- Overall evaluation summary`;

  try {
    const resp = await axios.post(
      `${baseURL}/chat/completions`,
      {
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.7,
        max_tokens: 650
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      }
    );

    const text =
      resp.data?.choices?.[0]?.message?.content &&
      String(resp.data.choices[0].message.content).trim();
    return text || buildFallbackFeedback(input);
  } catch (e) {
    return buildFallbackFeedback(input);
  }
}

module.exports = {
  generateAtsFeedback
};

