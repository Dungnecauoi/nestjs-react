import React from 'react';
import { Table, TableProps } from 'antd';

export interface DataTableProps<T> extends TableProps<T> {
  searchPlaceholder?: string;
}

export function DataTable<T extends object>({
  columns,
  dataSource,
  rowKey = 'id',
  pagination = { pageSize: 10, showSizeChanger: true },
  ...props
}: DataTableProps<T>) {
  return (
    <Table<T>
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      pagination={pagination}
      {...props}
    />
  );
}

export default DataTable;
