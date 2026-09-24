import OpenAI from 'openai';

export const isConfigured = () => Boolean(process.env.OPENAI_API_KEY);

export const generate = async ({ modelId, systemPrompt, userPrompt, imageBase64 }) => {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const userContent = [{ type: 'text', text: `User Request: ${userPrompt}` }];
  if (imageBase64) {
    const url = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
    userContent.push({ type: 'image_url', image_url: { url } });
  }

  const completion = await client.chat.completions.create({
    model: modelId,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ]
  });

  return completion.choices[0]?.message?.content || '';
};
