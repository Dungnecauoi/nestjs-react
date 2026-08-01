import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Input, Switch, Button, Row, Col, Select, Space, Divider } from 'antd';
import { CloudServerOutlined } from '@ant-design/icons';
import { storageConfigApi } from '../../../api/modules/storage-config.api';
import { notify } from '../../../utils/notify';

export function StorageConfigTabContent() {
  const { t } = useTranslation();
  const form = Form.useFormInstance(); // Sử dụng chung Form instance từ cha
  const disk = Form.useWatch('disk', form);
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      await storageConfigApi.testConnection();
      notify.success(t('settings.testS3Success'));
    } catch (err: any) {
      notify.error(err, t('settings.testS3Failed'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card variant="borderless" style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Form.Item name="disk" label={t('settings.storageDriverLabel')} rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'local', label: t('settings.driverLocal') },
                { value: 's3', label: t('settings.driverS3') },
              ]}
            />
          </Form.Item>
        </Col>

        {disk === 's3' && (
          <Col xs={24}>
            <Divider style={{ margin: '8px 0 16px 0' }} />
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="s3AccessKeyId" label="Access Key ID">
                  <Input.Password />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="s3SecretAccessKey" label="Secret Access Key">
                  <Input.Password />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="s3Region" label="Region">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="s3Bucket" label="Bucket">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={16}>
                <Form.Item name="s3Endpoint" label={t('settings.s3Endpoint')}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="s3ForcePathStyle"
                  label={t('settings.s3ForcePathStyle')}
                  valuePropName="checked"
                  extra={t('settings.s3ForcePathStyleExtra')}
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Space style={{ marginTop: 8 }}>
                  <Button icon={<CloudServerOutlined />} loading={testing} onClick={handleTestConnection}>
                    {t('settings.testS3ConnectionBtn')}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Col>
        )}
      </Row>
    </Card>
  );
}
