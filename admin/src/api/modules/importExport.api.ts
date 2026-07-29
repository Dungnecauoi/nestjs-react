import api from '../axios';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const importExportApi = {
  // ── CSV ──────────────────────────────────────────────────
  exportUsersCsv: async () => {
    const res = await api.get('/import-export/export/users', { responseType: 'blob' });
    downloadBlob(
      new Blob([res.data], { type: 'text/csv;charset=utf-8;' }),
      `users_export_${Date.now()}.csv`,
    );
  },

  exportDepartmentsCsv: async () => {
    const res = await api.get('/import-export/export/departments', { responseType: 'blob' });
    downloadBlob(
      new Blob([res.data], { type: 'text/csv;charset=utf-8;' }),
      `departments_export_${Date.now()}.csv`,
    );
  },

  // ── Excel ─────────────────────────────────────────────────
  exportUsersExcel: async () => {
    const res = await api.get('/import-export/export/users/excel', { responseType: 'blob' });
    downloadBlob(
      new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `users_export_${Date.now()}.xlsx`,
    );
  },

  exportDepartmentsExcel: async () => {
    const res = await api.get('/import-export/export/departments/excel', { responseType: 'blob' });
    downloadBlob(
      new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `departments_export_${Date.now()}.xlsx`,
    );
  },

  // ── Import CSV ────────────────────────────────────────────
  importUsersCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/import-export/import/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data?.data || res.data;
  },
};
