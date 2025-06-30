import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();


/**
 * Query the Azure Cognitive Search index with the given question.
 * @param {string} query
 * @returns {Promise<Array<{ source: string, content: string }>>}
 */

function getCustomFilters(userInput) {
  const filters = [];

  // Match common marketing terms to price ranges
  if (/mid[-\s]?range/i.test(userInput)) {
    filters.push("monthly_price ge 400 and monthly_price le 500");
  } else if (/low[-\s]?budget|cheap/i.test(userInput)) {
    filters.push("monthly_price le 300");
  } else if (/premium|luxury/i.test(userInput)) {
    filters.push("monthly_price ge 800");
  }

  // Match features
  if (/family/i.test(userInput)) {
    filters.push("features/any(f: f eq 'family')");
  }
  if (/safety/i.test(userInput)) {
    filters.push("features/any(f: f eq 'safety')");
  }

  return filters.join(' and ');
}

export async function searchAzureDocs(query) {
  const endpoint = `${process.env.AZURE_SEARCH_ENDPOINT}/indexes/${process.env.AZURE_SEARCH_INDEX_NAME}/docs/search?api-version=2023-07-01-Preview`;

  const headers = {
    'Content-Type': 'application/json',
    'api-key': process.env.AZURE_SEARCH_API_KEY
  };

  let priceFilter = '';
  let featureFilter = '';

  if (query.toLowerCase().includes('mid-range')) {
    priceFilter = "monthly_price ge 400 and monthly_price le 600";
  }
  if (query.toLowerCase().includes('family')) {
    featureFilter = "features/any(f: f eq 'family')";
  }
  if (query.toLowerCase().includes('safety')) {
    featureFilter += (featureFilter ? " and " : "") + "features/any(f: f eq 'safety')";
  }

  const filterClause = [priceFilter, featureFilter].filter(Boolean).join(' and ');

  const body = {
    search: query,
    top: 5,
    filter: filterClause
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
