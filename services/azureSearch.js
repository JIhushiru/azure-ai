import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();


/**
 * Query the Azure Cognitive Search index with the given question.
 * @param {string} query
 * @returns {Promise<Array<{ source: string, content: string }>>}
 */

export async function searchAzureDocs(query) {
  const endpoint = `${process.env.AZURE_SEARCH_ENDPOINT}/indexes/${process.env.AZURE_SEARCH_INDEX_NAME}/docs/search?api-version=2023-07-01-Preview`;

  const headers = {
    'Content-Type': 'application/json',
    'api-key': process.env.AZURE_SEARCH_API_KEY
  };

  const body = {
    search: query,
    top: 5,
    // searchFields: 'content' 
    // For semantic search enabled, we can add:
    // "queryType": "semantic",
    // "semanticConfiguration": "default"
  };

  try {
    const res = await axios.post(endpoint, body, { headers });
    const docs = res.data.value;

    const chunks = docs.map(doc => ({
      source: doc.metadata_storage_name || doc.fileName || 'Unknown Source',
      content: doc.merged_content || doc.content || ''
    })).filter(item => item.content);


    return chunks;
  } catch (err) {
    console.error('Azure Search Error:', err.response?.data || err.message);
    return [];
  }
}
