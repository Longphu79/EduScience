"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Group,
  Pagination,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";

const DEFAULT_PAGE_SIZES = ["5", "10", "20"];

export function DataTableCard({
  title,
  description,
  columns,
  records,
  initialPageSize = 5,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  emptyState = "No records available.",
  summary,
}) {
  const allRecords = records || [];
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(String(initialPageSize));

  const numericPageSize = Number(pageSize) || initialPageSize;
  const totalPages = Math.max(1, Math.ceil(allRecords.length / numericPageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedRecords = useMemo(() => {
    const start = (page - 1) * numericPageSize;
    return allRecords.slice(start, start + numericPageSize);
  }, [allRecords, numericPageSize, page]);

  return (
    <Paper radius="md" p="xl" className="management-panel">
      <Stack gap="lg">
        <div>
          <div>
            <Badge color="blue" variant="light">
              Operations table
            </Badge>
            <Title order={2} mt="sm">
              {title}
            </Title>
            {description ? (
              <Text c="dimmed" mt="xs">
                {description}
              </Text>
            ) : null}
          </div>
        </div>

        {summary ? <Text c="dimmed">{summary}</Text> : null}

        <ScrollArea>
          <Table
            highlightOnHover
            verticalSpacing="md"
            horizontalSpacing="lg"
            miw={960}
            styles={{
              thead: {
                background: "#f8fafc",
              },
              th: {
                color: "#475569",
                fontSize: "0.86rem",
                fontWeight: 700,
                borderBottom: "1px solid #e6ebf2",
              },
              td: {
                borderBottom: "1px solid #edf2f7",
              },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                {columns.map((column) => (
                  <Table.Th key={column.key} w={column.width}>
                    {column.label}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {pagedRecords.length > 0 ? (
                pagedRecords.map((record) => (
                  <Table.Tr key={record._id || record.id || record.slug || record.key}>
                    {columns.map((column) => (
                      <Table.Td key={column.key}>
                        {column.render ? column.render(record) : record[column.key]}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={columns.length}>
                    <Text c="dimmed">{emptyState}</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <div className="management-table-footer">
          <Group gap="sm" align="center">
            <Text c="dimmed" size="sm">
              Items per page
            </Text>
            <Select
              aria-label="Items per page"
              radius="md"
              value={pageSize}
              onChange={(value) => {
                setPageSize(value || String(initialPageSize));
                setPage(1);
              }}
              data={pageSizeOptions.map((value) => ({ value, label: `${value} / page` }))}
              w={120}
            />
            <Text c="dimmed" size="sm">
              Showing {pagedRecords.length === 0 ? 0 : (page - 1) * numericPageSize + 1}-
              {Math.min(page * numericPageSize, allRecords.length)} of {allRecords.length}
            </Text>
          </Group>
          <Pagination total={totalPages} value={page} onChange={setPage} />
        </div>
      </Stack>
    </Paper>
  );
}
