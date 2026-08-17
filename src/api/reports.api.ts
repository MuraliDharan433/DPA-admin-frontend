import { apiClient } from './client';

async function downloadXlsx(path: string, filename: string) {
  const { data } = await apiClient.get(path, { responseType: 'blob' });
  const url = URL.createObjectURL(data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const reportsApi = {
  exportStudents: () => downloadXlsx('/reports/students/export', 'students.xlsx'),
  exportEnquiries: () => downloadXlsx('/reports/enquiries/export', 'enquiries.xlsx'),
  exportPlacements: () => downloadXlsx('/reports/placements/export', 'placements.xlsx'),
};
