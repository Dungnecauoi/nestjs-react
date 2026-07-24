import React from 'react';
import { Select, SelectProps } from 'antd';

export interface TagInputProps extends SelectProps {
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  placeholder = 'Gõ từ khóa để chọn tag...',
  ...props
}) => {
  return (
    <Select
      mode="multiple"
      showSearch
      placeholder={placeholder}
      optionFilterProp="label"
      style={{ width: '100%' }}
      {...props}
    />
  );
};

export default TagInput;
