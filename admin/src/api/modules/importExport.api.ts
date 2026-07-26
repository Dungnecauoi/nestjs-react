import api from '../axios';

export const importExportApi = {
  exportUsersCsv: async () => {
    const res = await api.get('/import-export/export/users', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportDepartmentsCsv: async () => {
    const res = await api.get('/import-export/export/departments', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `departments_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  importUsersCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/import-export/import/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },
};
