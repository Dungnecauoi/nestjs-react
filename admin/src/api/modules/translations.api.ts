import api from '../axios';

export interface DomainMeta {
  scopes: { key: string; name: string }[];
  backendDomains: string[];
  frontendDomains: string[];
  languages: { code: string; name: string }[];
}

export const translationsApi = {
  getDomains: async (): Promise<DomainMeta> => {
    const res = await api.get('/translations/domains');
    return res.data?.data || res.data;
  },

  getTranslations: async (scope: string, domain: string, lang: string): Promise<Record<string, string>> => {
    const res = await api.get(`/translations/${scope}/${domain}?lang=${lang}`);
    return res.data?.data?.data || res.data?.data || {};
  },

  updateTranslations: async (scope: string, domain: string, lang: string, payload: Record<string, string>) => {
    const res = await api.put(`/translations/${scope}/${domain}?lang=${lang}`, payload);
    return res.data?.data || res.data;
  },

  addLanguage: async (payload: { code: string; name?: string; cloneFrom?: string }) => {
    const res = await api.post('/translations/languages', payload);
    return res.data?.data || res.data;
  },

  deleteLanguage: async (code: string) => {
    const res = await api.delete(`/translations/languages/${code}`);
    return res.data?.data || res.data;
  },
};
