export const buildResumePrompt = (resumeText: string) => ({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content:
        'You extract structured candidate data from resume text. Return valid JSON only. Never invent unsupported information; use empty strings and empty arrays for missing values.'
    },
    {
      role: 'user',
      content: `Extract resume data in strict JSON format from this text:\n\n${resumeText.slice(0, 20000)}`
    }
  ],
  response_format: { type: 'json_object' }
});
