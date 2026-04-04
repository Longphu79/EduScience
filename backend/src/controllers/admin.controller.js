import * as payoutService from "../services/payout.service.js";
import * as dashboardService from "../services/dashboard.service.js";

export const getOverview = async (_req, res) => {
  try {
    const overview = await dashboardService.getAdminOverview();
    res.status(200).json(overview);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const getModerationQueue = async (_req, res) => {
  try {
    const queue = await dashboardService.getAdminModerationQueue();
    res.status(200).json(queue);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const listCourses = async (_req, res) => {
  try {
    const courses = await dashboardService.listAdminCourses();
    res.status(200).json(courses);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const getPayoutLedger = async (_req, res) => {
  try {
    const ledger = await payoutService.getAdminPayoutLedger();
    res.status(200).json(ledger);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const listPayoutRequests = async (_req, res) => {
  try {
    const requests = await payoutService.listAdminPayoutRequests();
    res.status(200).json(requests);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const updatePayoutRequest = async (req, res) => {
  try {
    const request = await payoutService.updateAdminPayoutRequest(
      req.params.requestId,
      req.body,
      req.actor,
    );
    res.status(200).json(request);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};
