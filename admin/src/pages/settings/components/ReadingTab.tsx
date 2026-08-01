import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Switch, Row, Col, Select, Radio, InputNumber, Divider } from 'antd';

interface ReadingTabProps {
  homepageDisplayType: string;
  setHomepageDisplayType: (val: string) => void;
}

export function ReadingTab({ homepageDisplayType, setHomepageDisplayType }: ReadingTabProps) {
  const { t } = useTranslation();

  return (
    <Card variant="borderless" style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
      <Row gutter={[24, 16]}>
        <Col xs={24}>
          <Form.Item name="homepageType" label={t('settings.homepageType')}>
            <Radio.Group
              onChange={(e) => setHomepageDisplayType(e.target.value)}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <Radio value="latest">{t('settings.latestPosts')}</Radio>
              <Radio value="static">{t('settings.staticPage')}</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>

        {homepageDisplayType === 'static' && (
          <Col xs={24} style={{ paddingLeft: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="staticHomepageId" label={t('settings.selectHomepage')}>
                  <Select
                    options={[
                      { value: 'home', label: t('settings.selectHomepagePlaceholder') },
                      { value: 'dashboard', label: t('settings.dashboardPage') },
                      { value: 'landing', label: t('settings.landingPage') },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="staticPostsPageId" label={t('settings.selectPostsPage')}>
                  <Select
                    options={[
                      { value: 'blog', label: t('settings.selectPostsPagePlaceholder') },
                      { value: 'news', label: t('settings.newsPage') },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        )}

        <Col xs={24}>
          <Divider style={{ margin: '8px 0 16px 0' }} />
        </Col>

        <Col xs={24} md={12}>
          <Form.Item name="postsPerPage" label={t('settings.postsPerPage')}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} addonAfter={t('settings.postsUnit')} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="allowSearchIndexing"
            label={t('settings.allowSearchIndexing')}
            valuePropName="checked"
            extra={t('settings.allowSearchIndexingHelp')}
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}
