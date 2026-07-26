import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Popover, List, Typography, Space, Tag, Tooltip, message } from 'antd';
import { BellOutlined, CheckOutlined, InfoCircleOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { notificationApi } from '../api/modules/notification.api';
import { useAuthStore } from '../store/useAuthStore';
import { NotificationItem } from '../types/auth.types';
import { useTheme } from '../context/ThemeContext';

const { Text } = Typography;

export const NotificationBell: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { isDark } = useTheme();

  // Fetch recent notifications via React Query
  const { data, refetch } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => notificationApi.getNotifications({ page: 1, limit: 5 }),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Fallback refetch every 30s
  });

  const notifications = data?.data || [];
  const unreadCount = data?.meta?.unreadCount || 0;

  // Realtime Socket.IO Connection
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    // Connect to Socket.IO notification namespace
    const socket = io('http://localhost:3000/notifications', {
      query: { userId: user.id },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('⚡ [WebSocket] Connected to Notifications Gateway');
    });

    socket.on('notification', (newNotify: NotificationItem) => {
      // Invalidate queries so UI updates instantly
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      message.info({
        content: `${newNotify.title}: ${newNotify.content}`,
        duration: 4,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user?.id, queryClient]);

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      message.success(t('notifications.markAllReadSuccess'));
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1677ff' }} />;
    }
  };

  const popoverContent = (
    <div style={{ width: 340, maxHeight: 420, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: isDark ? '1px solid #27272a' : '1px solid #f0f0f0' }}>
        <Text strong style={{ fontSize: 14 }}>
          {t('notifications.title')} ({unreadCount} {t('notifications.unread')})
        </Text>
        {unreadCount > 0 && (
          <Tooltip title={t('notifications.markAllAsRead')}>
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => markAllReadMutation.mutate()}
              loading={markAllReadMutation.isPending}
            >
              {t('notifications.markAllAsRead')}
            </Button>
          </Tooltip>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <Text type="secondary">{t('notifications.empty')}</Text>
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              onClick={() => {
                if (!item.isRead) markAsReadMutation.mutate(item.id);
              }}
              style={{
                cursor: 'pointer',
                padding: '10px 8px',
                borderRadius: 6,
                backgroundColor: !item.isRead ? (isDark ? '#1f1f23' : '#f0f7ff') : 'transparent',
                marginBottom: 4,
                transition: 'background-color 0.2s',
              }}
            >
              <List.Item.Meta
                avatar={getTypeIcon(item.type)}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 13, color: !item.isRead ? '#1677ff' : undefined }}>
                      {item.title}
                    </Text>
                    {!item.isRead && <Tag color="processing" style={{ fontSize: 10, margin: 0 }}>Mới</Tag>}
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      {item.content}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 10, marginTop: 2 }}>
                      {item.createdAt}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      <div style={{ marginTop: 12, paddingTop: 8, borderTop: isDark ? '1px solid #27272a' : '1px solid #f0f0f0', textAlign: 'center' }}>
        <Button type="link" size="small" onClick={() => navigate('/admin/notifications')}>
          {t('notifications.viewAll')}
        </Button>
      </div>
    </div>
  );

  return (
    <Popover content={popoverContent} trigger="click" placement="bottomRight">
      <Tooltip title={t('notifications.bellTooltip')}>
        <Badge count={unreadCount} overflowCount={99} size="small">
          <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
        </Badge>
      </Tooltip>
    </Popover>
  );
};
