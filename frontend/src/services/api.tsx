import axios from 'axios';


export const uploadFile = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData);
};

export const askQuestion = async (question: string): Promise<{ answer: string; sources: any[] }> => {
  const res = await axios.post(`${import.meta.env.VITE_API_URL}/ask`, { question });
  return res.data;
};

export const checkIndex = async (filename: string): Promise<{ found: boolean }> => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/check-index`, { params: { filename } });
  return res.data;
};
