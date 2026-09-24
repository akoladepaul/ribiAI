import Anthropic from '@anthropic-ai/sdk';

export const isConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

export const generate = async ({ modelId, systemPrompt, userPrompt, imageBase64 }) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const content = [{ type: 'text', text: `User Request: ${userPrompt}` }];
  if (imageBase64) {
    const data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    content.unshift({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data }
    });
  }

  const message = await client.messages.create({
    model: modelId,
    max_tokens: 1500,
    system: `${systemPrompt}\n\nRespond with ONLY the raw JSON object — no markdown fences, no commentary.`,
    messages: [{ role: 'user', content }]
  });

  return message.content.map((block) => (block.type === 'text' ? block.text : '')).join('');
};
