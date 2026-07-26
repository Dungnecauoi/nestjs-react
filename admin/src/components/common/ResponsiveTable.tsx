import React from 'react';
import { Table as AntTable, List, Card, Grid } from 'antd';
import type { TableProps } from 'antd';

export function ResponsiveTable<T extends object>({
  columns,
  dataSource,
  rowKey = 'id',
  loading,
  pagination,
  scroll,
  ...tableProps
}: TableProps<T>) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  if (isMobile) {
    const validColumns = ((columns || []) as any[]).filter((c) => c && !c.hidden);
    const firstCol = validColumns[0];
    const actionsCol = validColumns.find((c) => c.key === 'actions' || c.dataIndex === 'actions') || validColumns[validColumns.length - 1];
    const bodyCols = validColumns.filter((c) => c !== firstCol && c !== actionsCol);

    return (
      <List
        loading={loading}
        dataSource={dataSource as T[]}
        pagination={pagination ? (pagination as any) : false}
        renderItem={(item, index) => {
          const key = typeof rowKey === 'function' ? rowKey(item) : (item as any)[rowKey as string] || index;

          const firstVal = firstCol?.dataIndex ? (item as any)[firstCol.dataIndex] : undefined;
          const firstContent = firstCol?.render ? firstCol.render(firstVal, item, index) : firstVal;

          const actionsVal = actionsCol?.dataIndex ? (item as any)[actionsCol.dataIndex] : undefined;
          const actionsContent = actionsCol?.render ? actionsCol.render(actionsVal, item, index) : actionsVal;

          return (
            <Card
              key={String(key)}
              style={{ marginBottom: 12, borderRadius: 10, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}
              bodyStyle={{ padding: 12 }}
            >
              {/* Card Header: First Column Left, Actions Right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: bodyCols.length > 0 ? 8 : 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{firstContent}</div>
                {actionsCol && actionsCol !== firstCol && (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>{actionsContent}</div>
                )}
              </div>

              {/* Card Body: Middle Columns */}
              {bodyCols.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                  {bodyCols.map((col: any, colIdx: number) => {
                    const title = typeof col.title === 'function' ? col.title({}) : col.title;
                    const cellVal = col.dataIndex ? (item as any)[col.dataIndex] : undefined;
                    const renderedContent = col.render ? col.render(cellVal, item, index) : cellVal;

                    return (
                      <div
                        key={col.key || col.dataIndex || colIdx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        {title && (
                          <span style={{ fontWeight: 600, fontSize: 12, color: '#64748b', flexShrink: 0 }}>
                            {title}:
                          </span>
                        )}
                        <div style={{ fontSize: 12, flex: 1, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {renderedContent}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        }}
      />
    );
  }

  return (
    <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: 12, overflow: 'hidden' }}>
      <AntTable
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        loading={loading}
        pagination={pagination}
        scroll={scroll}
        {...tableProps}
      />
    </Card>
  );
}

export const Table = ResponsiveTable;
export default ResponsiveTable;
