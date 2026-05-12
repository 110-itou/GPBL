import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users
export const getUsers = () => api.get('/users');

// Deliveries
export const getDeliveries = (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  return api.get(`/deliveries?${queryParams}`);
};

export const createDelivery = (data) => api.post('/deliveries', data);
export const updateDelivery = (id, data) => api.put(`/deliveries/${id}`, data);
export const deleteDelivery = (id) => api.delete(`/deliveries/${id}`);
export const exportDeliveriesCSV = () => api.get('/deliveries/export/csv', { responseType: 'blob' });

// Movement Logs
export const getMovementLogs = (deliveryId) => api.get(`/deliveries/${deliveryId}/movements`);

// Attachments
export const getAttachments = (deliveryId) => api.get(`/deliveries/${deliveryId}/attachments`);
export const uploadAttachments = (deliveryId, files, uploadedBy) => {
  return api.post(`/deliveries/${deliveryId}/attachments`, {
    files,
    uploaded_by: uploadedBy
  });
};
export const deleteAttachment = (id) => api.delete(`/attachments/${id}`);

// Masters - Vendors
export const getVendors = () => api.get('/vendors');
export const createVendor = (data) => api.post('/vendors', data);
export const updateVendor = (id, data) => api.put(`/vendors/${id}`, data);
export const deleteVendor = (id) => api.delete(`/vendors/${id}`);

// Masters - Items
export const getItems = () => api.get('/items');
export const createItem = (data) => api.post('/items', data);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/items/${id}`);

// Calendar
export const getCalendarData = () => api.get('/calendar');

// Dashboard
export const getDashboardSummary = () => api.get('/dashboard/summary');

export default api;
