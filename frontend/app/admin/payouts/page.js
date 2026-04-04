"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { DataTableCard } from "@/components/data-table-card";
import { backendBrowserApiFetch, backendBrowserPutJson } from "@/lib/web-api";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function AdminPayoutsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [reference, setReference] = useState("");

  const load = async () => {
    const response = await backendBrowserApiFetch("/api/admin/payout-requests");
    setData(response);
  };

  useEffect(() => {
    load().catch((loadError) => setError(loadError.message));
  }, []);

  const startEdit = (item) => {
    setEditingId(item._id);
    setStatus(item.status);
    setReference(item.transferReference || "");
  };

  const submit = async () => {
    if (!editingId) {
      return;
    }

    try {
      await backendBrowserPutJson(`/api/admin/payout-requests/${editingId}`, {
        status,
        transferReference: reference,
      });
      setEditingId(null);
      setStatus("");
      setReference("");
      await load();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <Stack gap="lg" className="management-page">
      <Paper p="xl" radius="md" className="management-panel management-panel--soft">
        <div className="management-panel__header">
          <div>
            <Badge color="blue" variant="light">
              Finance
            </Badge>
            <Title order={1} mt="md">
              Payout queue
            </Title>
            <Text c="dimmed" mt="sm" maw={900}>
              Bảng payout kiểu quản trị để admin rà bank details, update status và chốt chuyển tiền
              ngoài hệ thống.
            </Text>
          </div>
          <Group gap="xs" wrap="wrap">
            <Badge color="yellow" variant="light">
              Pending: {data?.summary?.pending || 0}
            </Badge>
            <Badge color="blue" variant="light">
              Processing: {data?.summary?.processing || 0}
            </Badge>
            <Badge color="green" variant="light">
              Paid: {data?.summary?.paid || 0}
            </Badge>
          </Group>
        </div>
      </Paper>

      {error ? <Alert color="red">{error}</Alert> : null}

      {editingId ? (
        <Paper p="xl" radius="md" className="management-panel">
          <Stack gap="md">
            <div>
              <Title order={3}>Update payout request</Title>
              <Text c="dimmed" mt="sm">
                Cập nhật trạng thái sau khi admin hoàn thành manual transfer.
              </Text>
            </div>
            <Group grow align="flex-end">
              <Select
                label="Status"
                radius="md"
                value={status}
                onChange={(value) => setStatus(value || "")}
                data={[
                  { value: "processing", label: "processing" },
                  { value: "paid", label: "paid" },
                  { value: "rejected", label: "rejected" },
                ]}
              />
              <TextInput
                label="Transfer reference"
                radius="md"
                value={reference}
                onChange={(event) => setReference(event.currentTarget.value)}
              />
            </Group>
            <Group>
              <Button radius="md" onClick={submit}>
                Save update
              </Button>
              <Button radius="md" variant="light" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
            </Group>
          </Stack>
        </Paper>
      ) : null}

      <DataTableCard
        title="Payout operations table"
        description="Bảng payout có bank details, instructor owner và thao tác update trực tiếp."
        records={data?.items || []}
        summary={`${data?.items?.length || 0} payout requests`}
        emptyState="No payout requests found."
        columns={[
          {
            key: "payoutCode",
            label: "Request",
            width: 220,
            render: (item) => (
              <Stack gap={2}>
                <Text fw={700}>{item.payoutCode}</Text>
                <Text c="dimmed" size="sm">
                  {formatDateTime(item.createdAt)}
                </Text>
              </Stack>
            ),
          },
          {
            key: "instructor",
            label: "Instructor",
            render: (item) => (
              <Stack gap={2}>
                <Text>{item.instructorId?.name}</Text>
                <Text c="dimmed" size="sm">
                  {item.instructorId?.email || item.instructorId?.username || ""}
                </Text>
              </Stack>
            ),
          },
          {
            key: "amount",
            label: "Amount",
            render: (item) => formatCurrency(item.amount),
          },
          {
            key: "status",
            label: "Status",
            render: (item) => (
              <Badge
                color={
                  item.status === "paid"
                    ? "green"
                    : item.status === "processing"
                      ? "blue"
                      : "yellow"
                }
                variant="light"
              >
                {item.status}
              </Badge>
            ),
          },
          {
            key: "bank",
            label: "Bank details",
            width: 260,
            render: (item) => (
              <Stack gap={2}>
                <Text>Bank: {item.accountSnapshot?.bankName}</Text>
                <Text c="dimmed" size="sm">
                  Account: {item.accountSnapshot?.accountNumber}
                </Text>
                <Text c="dimmed" size="sm">
                  Holder: {item.accountSnapshot?.accountHolderName}
                </Text>
              </Stack>
            ),
          },
          {
            key: "note",
            label: "Note",
            render: (item) => (
              <Text c="dimmed" lineClamp={2}>
                {item.requestedNote || "No note"}
              </Text>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            width: 140,
            render: (item) => (
              <Button size="xs" radius="md" variant="light" onClick={() => startEdit(item)}>
                Update
              </Button>
            ),
          },
        ]}
      />
    </Stack>
  );
}
