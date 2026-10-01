import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/account";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

export const getAddresses = async () => {
  const response = await axios.get(`${API_BASE_URL}/shipping/list/`, getAuthHeaders());
  return response.data;
};

export const createAddress = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/shipping/create/`, data, getAuthHeaders());
  return response.data;
};

export const updateAddress = async (id, data) => {
  const response = await axios.put(`${API_BASE_URL}/shipping/update/${id}/`, data, getAuthHeaders());
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/shipping/delete/${id}/`, getAuthHeaders());
  return response.data;
};

export const setDefaultAddress = async (id) => {
  const response = await axios.post(`${API_BASE_URL}/shipping/default/${id}/`, {}, getAuthHeaders());
  return response.data;
};