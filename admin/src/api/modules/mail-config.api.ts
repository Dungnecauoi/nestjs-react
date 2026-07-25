import api from '../axios';

export type MailDriverName = 'log' | 'smtp' | 'gmail_oauth' | 'resend' | 'ses' | 'mailgun' | 'sendgrid';

export interface MailConfigResponse {
  driver: MailDriverName;
  fromAddress?: string;
  fromName?: string;
  smtp?: { host: string; port: number; secure?: boolean; username?: string; configured: boolean };
  gmailOauth?: { email: string; configured: boolean };
  resend?: { configured: boolean };
  ses?: { region: string; configured: boolean };
  mailgun?: { domain: string; configured: boolean };
  sendgrid?: { configured: boolean };
}

export interface MailConfigSaveDto {
  driver: MailDriverName;
  fromAddress?: string;
  fromName?: string;
  smtp?: { host?: string; port?: number; secure?: boolean; username?: string; password?: string };
  resend?: { apiKey?: string };
  ses?: { accessKeyId?: string; secretAccessKey?: string; region?: string };
  mailgun?: { apiKey?: string; domain?: string };
  sendgrid?: { apiKey?: string };
}

export const mailConfigApi = {
  getMailConfig: async (): Promise<MailConfigResponse> => {
    const res = await api.get('/options/mail-config');
    return res.data?.data || res.data;
  },

  saveMailConfig: async (dto: MailConfigSaveDto): Promise<MailConfigResponse> => {
    const res = await api.post('/options/mail-config', dto);
    return res.data?.data || res.data;
  },

  sendTestEmail: async (testEmail: string) => {
    const res = await api.post('/options/mail-config/test', { testEmail });
    return res.data?.data || res.data;
  },

  getGmailConnectUrl: async (): Promise<string> => {
    const res = await api.get('/options/mail-config/gmail-oauth/connect-url');
    const data = res.data?.data || res.data;
    return data.url;
  },

  exchangeGmailCode: async (code: string): Promise<MailConfigResponse> => {
    const res = await api.post('/options/mail-config/gmail-oauth/exchange', { code });
    return res.data?.data || res.data;
  },

  disconnectGmail: async (): Promise<MailConfigResponse> => {
    const res = await api.delete('/options/mail-config/gmail-oauth');
    return res.data?.data || res.data;
  },
};
