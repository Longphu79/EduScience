import InstructorPayoutAccount from "../models/InstructorPayoutAccount.js";
import Instructor from "../models/Instructor.js";
import PayoutRequest from "../models/PayoutRequest.js";
import { getInstructorProfileForActor } from "./access.service.js";
import { createHttpError } from "../utils/httpError.js";

const FINAL_STATUSES = new Set(["paid", "rejected"]);
const PAYOUT_STATUS_SUMMARY = ["pending", "processing", "paid"];

const normalizeAmount = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw createHttpError(400, "Invalid payout amount");
  }

  return parsed;
};

const requireAccountField = (value, fieldName) => {
  const normalized = value?.trim();
  if (!normalized) {
    throw createHttpError(400, `${fieldName} is required`);
  }

  return normalized;
};

const buildAccountSnapshot = (account) => ({
  bankName: account.bankName,
  accountNumber: account.accountNumber,
  accountHolderName: account.accountHolderName,
  branch: account.branch ?? "",
  transferNote: account.transferNote ?? "",
});

const buildBalanceSummary = (revenue, requests) => {
  const summary = {
    lifetimeRevenue: revenue ?? 0,
    pendingAmount: 0,
    processingAmount: 0,
    paidAmount: 0,
    availableBalance: revenue ?? 0,
  };

  for (const request of requests) {
    if (!PAYOUT_STATUS_SUMMARY.includes(request.status)) {
      continue;
    }

    if (request.status === "pending") {
      summary.pendingAmount += request.amount;
    } else if (request.status === "processing") {
      summary.processingAmount += request.amount;
    } else if (request.status === "paid") {
      summary.paidAmount += request.amount;
    }
  }

  summary.availableBalance = Math.max(
    0,
    summary.lifetimeRevenue -
      summary.pendingAmount -
      summary.processingAmount -
      summary.paidAmount,
  );

  return summary;
};

const populatePayoutRequests = (query) =>
  query
    .populate({
      path: "instructorId",
      select: "name avatarUrl rating revenue userId",
      populate: {
        path: "userId",
        select: "username email avatarUrl",
      },
    })
    .populate("processedByUserId", "username email");

const buildPayoutCode = () =>
  `PAYOUT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

export const getInstructorPayoutAccount = async (actor) => {
  const instructor = await getInstructorProfileForActor(actor);

  return await InstructorPayoutAccount.findOne({ instructorId: instructor._id });
};

export const upsertInstructorPayoutAccount = async (accountData, actor) => {
  const instructor = await getInstructorProfileForActor(actor);

  const payload = {
    bankName: requireAccountField(accountData.bankName, "bankName"),
    accountNumber: requireAccountField(
      accountData.accountNumber,
      "accountNumber",
    ),
    accountHolderName: requireAccountField(
      accountData.accountHolderName,
      "accountHolderName",
    ),
    branch: accountData.branch?.trim() ?? "",
    transferNote: accountData.transferNote?.trim() ?? "",
  };

  return await InstructorPayoutAccount.findOneAndUpdate(
    { instructorId: instructor._id },
    {
      instructorId: instructor._id,
      ...payload,
    },
    { upsert: true, new: true },
  );
};

export const listInstructorPayoutRequests = async (actor) => {
  const instructor = await getInstructorProfileForActor(actor);
  const requests = await PayoutRequest.find({ instructorId: instructor._id })
    .sort({ createdAt: -1 })
    .lean();

  return requests;
};

export const getInstructorPayoutWorkspace = async (actor) => {
  const instructor = await getInstructorProfileForActor(actor);
  const [account, requests] = await Promise.all([
    InstructorPayoutAccount.findOne({ instructorId: instructor._id }).lean(),
    PayoutRequest.find({ instructorId: instructor._id })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return {
    instructor: {
      id: instructor._id,
      name: instructor.name,
      revenue: instructor.revenue,
    },
    balance: buildBalanceSummary(instructor.revenue, requests),
    payoutAccount: account,
    payoutRequests: requests,
  };
};

export const createInstructorPayoutRequest = async (requestData, actor) => {
  const instructor = await getInstructorProfileForActor(actor);
  const account = await InstructorPayoutAccount.findOne({
    instructorId: instructor._id,
  });

  if (!account) {
    throw createHttpError(400, "Link a payout account before requesting payout");
  }

  const amount = normalizeAmount(requestData.amount);
  const existingRequests = await PayoutRequest.find({
    instructorId: instructor._id,
  }).lean();
  const balance = buildBalanceSummary(instructor.revenue, existingRequests);

  if (amount > balance.availableBalance) {
    throw createHttpError(400, "Requested amount exceeds available balance");
  }

  return await PayoutRequest.create({
    payoutCode: buildPayoutCode(),
    instructorId: instructor._id,
    payoutAccountId: account._id,
    accountSnapshot: buildAccountSnapshot(account),
    amount,
    requestedNote: requestData.requestedNote?.trim() ?? "",
    status: "pending",
    requestedAt: new Date(),
    statusHistory: [
      {
        status: "pending",
        note: requestData.requestedNote?.trim() ?? "",
        userId: actor.userId,
        timestamp: new Date(),
      },
    ],
  });
};

export const listAdminPayoutRequests = async () => {
  const requests = await populatePayoutRequests(
    PayoutRequest.find({}).sort({ createdAt: -1 }),
  ).lean();

  const summary = requests.reduce(
    (acc, request) => {
      if (request.status === "pending") {
        acc.pending += 1;
      } else if (request.status === "processing") {
        acc.processing += 1;
      } else if (request.status === "paid") {
        acc.paid += 1;
      } else if (request.status === "rejected") {
        acc.rejected += 1;
      }

      acc.totalAmount += request.amount;
      return acc;
    },
    { pending: 0, processing: 0, paid: 0, rejected: 0, totalAmount: 0 },
  );

  return { summary, items: requests };
};

export const updateAdminPayoutRequest = async (requestId, updateData, actor) => {
  const request = await PayoutRequest.findById(requestId);

  if (!request) {
    throw createHttpError(404, "Payout request not found");
  }

  const nextStatus = updateData.status?.trim();

  if (!["processing", "paid", "rejected"].includes(nextStatus)) {
    throw createHttpError(400, "Unsupported payout status");
  }

  if (FINAL_STATUSES.has(request.status) && request.status !== nextStatus) {
    throw createHttpError(400, "Payout request is already finalized");
  }

  request.status = nextStatus;
  request.reviewedNote = updateData.reviewedNote?.trim() ?? request.reviewedNote;
  request.transferReference =
    updateData.transferReference?.trim() ?? request.transferReference;
  request.processedByUserId = actor.userId;

  if (nextStatus === "paid" || nextStatus === "rejected") {
    request.processedAt = new Date();
  }

  request.statusHistory = request.statusHistory ?? [];
  request.statusHistory.push({
    status: nextStatus,
    note:
      updateData.reviewedNote?.trim() ||
      updateData.transferReference?.trim() ||
      "",
    userId: actor.userId,
    timestamp: new Date(),
  });

  await request.save();

  return await populatePayoutRequests(
    PayoutRequest.findById(request._id),
  ).lean();
};

export const getAdminPayoutLedger = async () => {
  const requests = await populatePayoutRequests(
    PayoutRequest.find({}).sort({ createdAt: -1 }),
  ).lean();

  const summary = {
    total: requests.length,
    pending: 0,
    processing: 0,
    paid: 0,
    rejected: 0,
  };

  for (const request of requests) {
    if (request.status === "pending") summary.pending += 1;
    if (request.status === "processing") summary.processing += 1;
    if (request.status === "paid") summary.paid += 1;
    if (request.status === "rejected") summary.rejected += 1;
  }

  return {
    summary,
    items: requests.map((request) => ({
      payoutCode: request.payoutCode,
      amount: request.amount,
      status: request.status,
      instructor: request.instructorId?.name ?? "Unknown",
      instructorEmail: request.instructorId?.userId?.email,
      account: request.accountSnapshot,
      requestedAt: request.requestedAt,
      processedAt: request.processedAt,
      transferReference: request.transferReference,
      statusHistory: (request.statusHistory || []).map((entry) => ({
        status: entry.status,
        note: entry.note,
        userId: entry.userId,
        timestamp: entry.timestamp,
      })),
    })),
  };
};
