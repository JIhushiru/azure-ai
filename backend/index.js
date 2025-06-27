import { searchAzureDocs } from '../services/azureSearch.js';
import { askOpenAI } from '../services/openai.js';
import { BlobServiceClient } from '@azure/storage-blob';
import cors from 'cors';
import multer from 'multer';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// MIDDLEWARE first
app.use(cors());
app.use(bodyParser.json());

// ROUTES
const upload = multer();
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient('democontainer');

    const blockBlobClient = containerClient.getBlockBlobClient(req.file.originalname);
    await blockBlobClient.upload(req.file.buffer, req.file.size);

    res.json({ success: true });
  } catch (err) {
    console.error('Upload Error:', err.message || err);
    res.status(500).json({ error: 'Upload failed.' });
  }
});


app.post('/ask', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Missing question in request body.' });
  }

  try {
    const chunks = await searchAzureDocs(question);

    const cleanedChunks = chunks.map((chunk, idx) => ({
      content: (chunk.content || '')
        .replace(/\[footnoteRef:\d+\]/gi, '')
        .replace(/\[\d+:.*?\]/g, '')
        .replace(/\n{2,}/g, '\n') // collapse excessive newlines
        .trim()
    }));
    console.log(cleanedChunks)
    const answer = await askOpenAI(question, cleanedChunks);

    res.json({ answer, sources: cleanedChunks }); // send cleanedChunks to UI
  } catch (err) {
    console.error('Error in /ask:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});


app.get('/check-index', async (req, res) => {
  const filename = req.query.filename;

  try {
      const result = await axios.post(
        `${process.env.AZURE_SEARCH_ENDPOINT}/indexes/${process.env.AZURE_SEARCH_INDEX_NAME}/docs/search?api-version=2023-07-01-Preview`,
        {
          search: `"${filename}"`,
          searchFields: 'metadata_storage_name',
          top: 1
        },
        {
          headers: {
            'api-key': process.env.AZURE_SEARCH_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Searching for filename:', filename);
      console.log('Response:', result.data);
    const found = result.data.value.length > 0;
    res.json({ found });
  } catch (err) {
    console.error('Index check error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Index check failed' });
  }
});


app.get('/check-indexer-status', async (req, res) => {
  try {
    const result = await axios.get(
      `${process.env.AZURE_SEARCH_ENDPOINT}/indexers/${process.env.AZURE_SEARCH_INDEXER_NAME}/status?api-version=2023-07-01-Preview`,
      {
        headers: {
          'api-key': process.env.AZURE_SEARCH_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const status = result.data.lastResult?.status || 'unknown';

    res.json({ status });
  } catch (err) {
    console.error('Indexer status error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Could not get indexer status' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
