"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";

import { DataTableCard } from "@/components/data-table-card";
import {
  backendBrowserApiFetch,
  backendBrowserPostJson,
  backendBrowserPutJson,
} from "@/lib/web-api";
import { formatCurrency, formatDateTime } from "@/lib/format";

const emptyAccount = {
  bankName: "",
  accountNumber: "",
  accountHolderName: "",
  branch: "",
  transferNote: "",
};

export default function InstructorPayoutsPage() {
  const [workspace, setWorkspace] = useState(null);
  const [account, setAccount] = useState(emptyAccount);
  const [requestAmount, setRequestAmount] = useState(0);
  const [requestNote, setRequestNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadWorkspace = async () => {
    const data = await backendBrowserApiFetch("/api/instructor/payouts/workspace");
    setWorkspace(data);
    setAccount(data.payoutAccount || emptyAccount);
  };

  useEffect(() => {
    loadWorkspace().catch((loadError) => setError(loadError.message));
  }, []);

  const handleSaveAccount = async () => {
    setSaving(true);
    setError("");
    try {
      await backendBrowserPutJson("/api/instructor/payout-account", account);
      await loadWorkspace();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRequest = async () => {
    setSaving(true);
    setError("");
    try {
      await backendBrowserPostJson(
        "/api/instructor/payout-requests",
        { amount: requestAmount, requestedNote: requestNote },
      );
      setRequestAmount(0);
      setRequestNote("");
      await loadWorkspace();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>Payout management</Title>
        <Text c="dimmed" mt="sm">
          Link your bank account here, then send payout requests. Admin will transfer to this account and mark the request as paid.
        </Text>
      </div>

      {error ? <Alert color="red">{error}</Alert> : null}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card radius="lg" padding="xl" className="glass-card">
          <Title order={3}>Linked bank account</Title>
          <Stack mt="lg" gap="md">
            <TextInput
              label="Bank name"
              radius="lg"
              value={account.bankName}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setAccount((prev) => ({ ...prev, bankName: value }));
              }}
            />
            <TextInput
              label="Account number"
              radius="lg"
              value={account.accountNumber}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setAccount((prev) => ({
                  ...prev,
                  accountNumber: value,
                }));
              }}
            />
            <TextInput
              label="Account holder"
              radius="lg"
              value={account.accountHolderName}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setAccount((prev) => ({
                  ...prev,
                  accountHolderName: value,
                }));
              }}
            />
            <TextInput
              label="Branch"
              radius="lg"
              value={account.branch}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setAccount((prev) => ({ ...prev, branch: value }));
              }}
            />
            <TextInput
              label="Transfer note"
              radius="lg"
              value={account.transferNote}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setAccount((prev) => ({
                  ...prev,
                  transferNote: value,
                }));
              }}
            />
            <Button radius="lg" onClick={handleSaveAccount} loading={saving}>
              Save payout account
            </Button>
          </Stack>
        </Card>

        <Card radius="lg" padding="xl" className="glass-card">
          <Title order={3}>Available balance</Title>
          <Stack mt="lg" gap="md">
            <Text>Lifetime revenue: {formatCurrency(workspace?.balance?.lifetimeRevenue)}</Text>
            <Text>
              Available payout: {formatCurrency(workspace?.balance?.availableBalance)}
            </Text>
            <Text>
              Pending + processing:{" "}
              {formatCurrency(
                (workspace?.balance?.pendingAmount || 0) +
                  (workspace?.balance?.processingAmount || 0),
              )}
            </Text>
            <NumberInput
              label="Request amount"
              radius="lg"
              min={0}
              value={requestAmount}
              onChange={setRequestAmount}
            />
            <Textarea
              label="Note to admin"
              radius="lg"
              minRows={3}
              value={requestNote}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setRequestNote(value);
              }}
            />
            <Button radius="lg" variant="light" onClick={handleCreateRequest} loading={saving}>
              Send payout request
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>

      <DataTableCard
        title="Payout history"
        description="Track every request sent to admin, including transfer state and audit timestamps."
        records={workspace?.payoutRequests || []}
        summary={`${workspace?.payoutRequests?.length || 0} requests`}
        emptyState="No payout requests yet."
        columns={[
          {
            key: "payoutCode",
            label: "Code",
            render: (request) => (
              <Stack gap={2}>
                <Text fw={700}>{request.payoutCode}</Text>
                <Text c="dimmed" size="sm">
                  {formatDateTime(request.createdAt)}
                </Text>
              </Stack>
            ),
          },
          {
            key: "amount",
            label: "Amount",
            render: (request) => formatCurrency(request.amount),
          },
          {
            key: "status",
            label: "Status",
            render: (request) => (
              <Text fw={600} tt="capitalize">
                {request.status}
              </Text>
            ),
          },
          {
            key: "requestedNote",
            label: "Note",
            render: (request) => (
              <Text c="dimmed" lineClamp={2}>
                {request.requestedNote || "No note"}
              </Text>
            ),
          },
          {
            key: "updatedAt",
            label: "Updated",
            render: (request) => formatDateTime(request.updatedAt || request.createdAt),
          },
        ]}
      />
    </Stack>
  );
}
