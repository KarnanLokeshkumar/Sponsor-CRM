const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...(sessionStorage.getItem('sponsor-crm-token') ? { Authorization: `Bearer ${sessionStorage.getItem('sponsor-crm-token')}` } : {}), ...options.headers }, ...options });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const body = await response.json(); message = body.detail || body.message || body.error || message; } catch { /* no response body */ }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}
export const api = {
  login: data => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  sponsors: (params = {}) => request(`/sponsors?${new URLSearchParams(params)}`),
  sponsorStats: () => request('/sponsors/stats'),
  createSponsor: data => request('/sponsors', { method: 'POST', body: JSON.stringify(data) }),
  updateSponsor: (id, data) => request(`/sponsors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSponsor: id => request(`/sponsors/${id}`, { method: 'DELETE' }),
  campaigns: () => request('/campaigns'), createCampaign: data => request('/campaigns', { method: 'POST', body: JSON.stringify(data) }), updateCampaign: (id,data) => request(`/campaigns/${id}`, {method:'PUT',body:JSON.stringify(data)}), deleteCampaign: id => request(`/campaigns/${id}`,{method:'DELETE'}),
  deliverables: () => request('/deliverables'), createDeliverable: data => request('/deliverables',{method:'POST',body:JSON.stringify(data)}), updateDeliverable:(id,data)=>request(`/deliverables/${id}`,{method:'PUT',body:JSON.stringify(data)}), deleteDeliverable:id=>request(`/deliverables/${id}`,{method:'DELETE'}),
  benefits: () => request('/benefits'), createBenefit: data => request('/benefits',{method:'POST',body:JSON.stringify(data)}), updateBenefit:(id,data)=>request(`/benefits/${id}`,{method:'PUT',body:JSON.stringify(data)}), deleteBenefit:id=>request(`/benefits/${id}`,{method:'DELETE'}),
  workspaceRecords: (moduleKey, params = {}) => request(`/workspace/${moduleKey}?${new URLSearchParams(params)}`),
  workspaceSummary: moduleKey => request(`/workspace/${moduleKey}/summary`),
  createWorkspaceRecord: (moduleKey, data) => request(`/workspace/${moduleKey}`, { method: 'POST', body: JSON.stringify(data) }),
  updateWorkspaceRecord: (moduleKey, id, data) => request(`/workspace/${moduleKey}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkspaceRecord: (moduleKey, id) => request(`/workspace/${moduleKey}/${id}`, { method: 'DELETE' })
};
