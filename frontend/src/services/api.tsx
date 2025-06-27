import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const uploadFile = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  await axios.post(`${API_URL}/upload`, formData);
};

export const askQuestion = async (question: string): Promise<{ answer: string; sources: any[] }> => {
  const res = await axios.post(`${API_URL}/ask`, { question });
  return res.data;
};

export const checkIndex = async (filename: string): Promise<{ found: boolean }> => {
  const res = await axios.get(`${API_URL}/check-index`, { params: { filename } });
  return res.data;
};
