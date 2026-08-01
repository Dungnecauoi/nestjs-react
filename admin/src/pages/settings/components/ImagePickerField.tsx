import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { MediaPickerModal } from '../../../components/common/MediaPickerModal';
import { MediaItem } from '../../../api/modules/media.api';

interface ImagePickerFieldProps {
  value?: string;
  onChange?: (url: string) => void;
  pickerTitle: string;
}

export function ImagePickerField({ value, onChange, pickerTitle }: ImagePickerFieldProps) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {value ? (
        <img
          src={value}
          alt=""
          style={{ width: 48, height: 48, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff' }}
        />
      ) : (
        <div
          style={{
            width: 48,
            height: 48,
            border: '1px dashed #cbd5e1',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: 10,
          }}
        >
          {t('settings.noImageSelected')}
        </div>
      )}
      <Button icon={<UploadOutlined />} onClick={() => setPickerOpen(true)}>
        {t('settings.selectImageButton')}
      </Button>
      {value && (
        <Button danger type="text" size="small" icon={<DeleteOutlined />} onClick={() => onChange?.('')} />
      )}
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media: MediaItem) => {
          onChange?.(media.url);
          setPickerOpen(false);
        }}
        accept="image"
        title={pickerTitle}
      />
    </div>
  );
}
