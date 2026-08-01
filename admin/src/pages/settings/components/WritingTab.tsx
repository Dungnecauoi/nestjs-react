import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Row, Col, Select } from 'antd';

export function WritingTab() {
  const { t } = useTranslation();

  return (
    <Card variant="borderless" style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Form.Item name="defaultCategory" label={t('settings.defaultCategory')}>
            <Select
              options={[
                { value: 'general', label: t('settings.categoryGeneral') },
                { value: 'news', label: t('settings.categoryNews') },
                { value: 'tech', label: t('settings.categoryTech') },
              ]}
            />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="defaultPostFormat" label={t('settings.defaultPostFormat')}>
            <Select
              options={[
                { value: 'standard', label: t('settings.formatStandard') },
                { value: 'gallery', label: t('settings.formatGallery') },
                { value: 'video', label: t('settings.formatVideo') },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}
