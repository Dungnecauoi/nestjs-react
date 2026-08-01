import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Switch, Row, Col, Select, Radio, Divider } from 'antd';
import { ImagePickerField } from './ImagePickerField';

export function GeneralTab() {
  const { t } = useTranslation();

  return (
    <Card variant="borderless" style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Form.Item name="siteTitle" label={t('settings.siteTitle')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="siteTagline" label={t('settings.siteTagline')}>
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="siteFavicon" label={t('settings.siteFavicon')}>
            <ImagePickerField pickerTitle={t('settings.siteFavicon')} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="siteLogo" label={t('settings.siteLogo')}>
            <ImagePickerField pickerTitle={t('settings.siteLogo')} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="adminEmail" label={t('settings.adminEmail')} rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Divider style={{ margin: '8px 0 16px 0' }} />
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="enable2FA"
            label={t('settings.enable2FA')}
            valuePropName="checked"
            extra={t('settings.enable2FAHelp')}
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="defaultUserRole" label={t('settings.defaultRole')}>
            <Select
              options={[
                { value: 'STAFF', label: t('settings.roleStaff') },
                { value: 'MANAGER', label: t('settings.roleManager') },
                { value: 'DEVELOPER', label: t('settings.roleDeveloper') },
                { value: 'USER', label: t('settings.roleUser') },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Divider style={{ margin: '8px 0 16px 0' }} />
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="siteLanguage" label={t('settings.siteLanguage')}>
            <Select
              options={[
                { value: 'vi', label: t('settings.langVi') },
                { value: 'en', label: t('settings.langEn') },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="timezone" label={t('settings.timezone')}>
            <Select
              options={[
                { value: 'Asia/Ho_Chi_Minh', label: t('settings.tzHoChiMinh') },
                { value: 'UTC', label: t('settings.tzUtc') },
                { value: 'America/New_York', label: t('settings.tzNewYork') },
                { value: 'Europe/London', label: t('settings.tzLondon') },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item name="dateFormat" label={t('settings.dateFormat')}>
            <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Radio value="DD/MM/YYYY">DD/MM/YYYY (24/07/2026)</Radio>
              <Radio value="YYYY-MM-DD">YYYY-MM-DD (2026-07-24)</Radio>
              <Radio value="MM/DD/YYYY">MM/DD/YYYY (07/24/2026)</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item name="timeFormat" label={t('settings.timeFormat')}>
            <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Radio value="HH:mm:ss">{t('settings.timeFormat24h')}</Radio>
              <Radio value="hh:mm A">{t('settings.timeFormat12h')}</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item name="weekStartDay" label={t('settings.weekStartDay')}>
            <Select
              options={[
                { value: 'Monday', label: t('settings.weekStartMonday') },
                { value: 'Sunday', label: t('settings.weekStartSunday') },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}
