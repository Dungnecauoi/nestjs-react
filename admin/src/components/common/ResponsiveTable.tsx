import React from 'react';
import { Table as AntTable, List, Card, Grid, Empty, theme } from 'antd';
import type { TableProps } from 'antd';
import { useTranslation } from 'react-i18next';

export function ResponsiveTable<T extends object>({
  columns,
  dataSource,
  rowKey = 'id',
  loading,
  pagination,
  scroll,
  locale,
  ...tableProps
}: TableProps<T>) {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const { t } = useTranslation();
  const { token } = theme.useToken();

  // B2: Custom Empty State kế thừa từ locale prop hoặc default
  const defaultEmpty = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={t('table.noData', 'Không có dữ liệu')}
    />
  );
  const emptyText = locale?.emptyText || defaultEmpty;

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
        locale={{ emptyText }}
        renderItem={(item, index) => {
          const key = typeof rowKey === 'function' ? rowKey(item) : (item as any)[rowKey as string] || index;

          const firstVal = firstCol?.dataIndex ? (item as any)[firstCol.dataIndex] : undefined;
          const firstContent = firstCol?.render ? firstCol.render(firstVal, item, index) : firstVal;

          const actionsVal = actionsCol?.dataIndex ? (item as any)[actionsCol.dataIndex] : undefined;
          const actionsContent = actionsCol?.render ? actionsCol.render(actionsVal, item, index) : actionsVal;

          return (
            <Card
              key={String(key)}
              style={{
                marginBottom: 12,
                borderRadius: 10,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                backgroundColor: token.colorBgContainer,
                borderColor: token.colorBorderSecondary,
              }}
              bodyStyle={{ padding: 12 }}
            >
              {/* Card Header: First Column Left, Actions Right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: bodyCols.length > 0 ? 8 : 0, gap: 8 }}>
                {/* B3: overflow ellipsis cho title dài trên mobile */}
                <div style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: token.colorText,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  minWidth: 0,
                }}>
                  {firstContent}
                </div>
                {actionsCol && actionsCol !== firstCol && (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>{actionsContent}</div>
                )}
              </div>

              {/* Card Body: Middle Columns */}
              {bodyCols.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  paddingTop: 8,
                  // B1: dùng token.colorBorderSecondary thay '#f1f5f9' tĩnh
                  borderTop: `1px solid ${token.colorBorderSecondary}`,
                }}>
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
                          <span style={{
                            fontWeight: 600,
                            fontSize: 12,
                            // B1: dùng token thay '#64748b' tĩnh
                            color: token.colorTextSecondary,
                            flexShrink: 0,
                          }}>
                            {title}:
                          </span>
                        )}
                        <div style={{ fontSize: 12, flex: 1, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', color: token.colorText }}>
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
    <Card
      bordered={false}
      bodyStyle={{ padding: 0 }}
      style={{
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: token.colorBgContainer,
      }}
    >
      <AntTable
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey}
        loading={loading}
        pagination={pagination}
        scroll={scroll}
        locale={{ emptyText }}
        {...tableProps}
      />
    </Card>
  );
}

export const Table = ResponsiveTable;
export default ResponsiveTable;
