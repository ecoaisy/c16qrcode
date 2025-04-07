import axios from 'axios';

const API_URL = 'https://your-subdomain/api';

export const getDonor = async (id: string) => {
  const response = await axios.get(`${API_URL}/donor/${id}`, {
    headers: { Authorization: `Bearer ${process.env.REACT_APP_API_TOKEN}` },
  });
  return response.data;
};

export const saveDonor = async (data: any) => {
  const response = await axios.post(`${API_URL}/donor`, data, {
    headers: { Authorization: `Bearer ${process.env.REACT_APP_API_TOKEN}` },
  });
  return response.data;
};