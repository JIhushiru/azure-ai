import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// const systemPrompt = `
// You are a helpful assistant. Answer the user's question based only on the provided context. 
// If the answer is not in the context, respond with "Sorry, I couldn't find the answer in the documents."
// `.trim();

const systemPrompt = `
You are a car recommendation assistant. Give helpful, friendly advice without saying things like “based on the source.” Just answer naturally.
`.trim();


/**
 * Format a filename for display in prompts
 * e.g. "my_file-name.docx" -> "My File Name"
 */
const formatSource = (filename) =>
  filename
    .replace(/\.[^/.]+$/, '')              // remove file extension
    .replace(/[_-]/g, ' ')                 // replace underscores/hyphens
    .replace(/\b\w/g, c => c.toUpperCase()); // capitalize each word

/**
 * Ask Azure OpenAI a question using provided chunks as context
 * @param {string} question - User's question
 * @param {Array<{ source: string, content: string }>} contextChunks - Cleaned context chunks
 */
export async function askOpenAI(question, contextChunks) {
  const endpoint = `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`;

  const headers = {
    'Content-Type': 'application/json',
    'api-key': process.env.AZURE_OPENAI_API_KEY
  };

  // Prepare prompt context
  // const context = contextChunks
  //   .map((chunk, idx) => {
  //     const source = formatSource(chunk.source || `Source ${idx + 1}`);
  //     const content = (chunk.content || '').trim().slice(0, 1000);
  //     return `Source: ${source}\n${content}`;
  //   })
  //   .join('\n\n');
    const context = contextChunks
    .map((chunk, idx) => {
      const content = (chunk.content || '').trim().slice(0, 1000);
      return `${content}`;
    })
    .join('\n\n');


  const body = {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Here’s some background info:\n\n${context}\n\nNow answer the question: ${question}` }

    ],
    temperature: 0.3,
    max_tokens: 500
  };

  try {
    const res = await axios.post(endpoint, body, { headers });
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('OpenAI Error:', err.response?.data || err.message);
    return 'An error occurred while trying to generate an answer.';
  }
}
