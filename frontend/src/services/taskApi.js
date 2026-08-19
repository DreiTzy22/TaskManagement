const API_BASE = import.meta.env.VITE_API_BASE || '/api/tasks';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchTasks = async (search = '', filter = 'all') => {
  const params = new URLSearchParams();
  if (search.trim()) params.append('search', search.trim());
  if (filter && filter !== 'all') params.append('filter', filter);

  const url = `${API_BASE}${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  return handleResponse(res);
};

export const createTask = async (title, description = '') => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
  return handleResponse(res);
};

export const updateTask = async (id, data) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteTask = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
};

export const toggleTaskComplete = async (id) => {
  const res = await fetch(`${API_BASE}/${id}/toggle`, {
    method: 'PATCH',
  });
  return handleResponse(res);
};
