import React from 'react';
import { Select, SelectProps } from 'antd';

export interface SearchableSelectProps extends SelectProps {
  placeholder?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  placeholder = 'Tìm kiếm và chọn...',
  ...props
}) => {
  return (
    <Select
      showSearch
      placeholder={placeholder}
      optionFilterProp="label"
      style={{ width: '100%' }}
      {...props}
    />
  );
};

export default SearchableSelect;
