import { GoogleGenerativeAI } from '@google/generative-ai';

export const isConfigured = () => Boolean(process.env.GEMINI_API_KEY);

export const generate = async ({ modelId, systemPrompt, userPrompt, imageBase64 }) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: modelId,
    generationConfig: { responseMimeType: 'application/json' }
  });

  const contents = [systemPrompt, `User Request: ${userPrompt}`];
  if (imageBase64) {
    const data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    contents.push({ inlineData: { mimeType: 'image/jpeg', data } });
  }

  const result = await model.generateContent(contents);
  return result.response.text();
};
