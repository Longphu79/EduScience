import * as payoutService from "../services/payout.service.js";
import * as dashboardService from "../services/dashboard.service.js";

export const getOverview = async (req, res) => {
  try {
    const overview = await dashboardService.getInstructorOverview(req.actor);
    res.status(200).json(overview);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const listCourses = async (req, res) => {
  try {
    const courses = await dashboardService.listInstructorCourses(req.actor);
    res.status(200).json(courses);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const getPayoutAccount = async (req, res) => {
  try {
    const account = await payoutService.getInstructorPayoutAccount(req.actor);
    res.status(200).json(account);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const upsertPayoutAccount = async (req, res) => {
  try {
    const account = await payoutService.upsertInstructorPayoutAccount(
      req.body,
      req.actor,
    );
    res.status(200).json(account);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const getPayoutWorkspace = async (req, res) => {
  try {
    const workspace = await payoutService.getInstructorPayoutWorkspace(req.actor);
    res.status(200).json(workspace);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const listPayoutRequests = async (req, res) => {
  try {
    const requests = await payoutService.listInstructorPayoutRequests(req.actor);
    res.status(200).json(requests);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const createPayoutRequest = async (req, res) => {
  try {
    const request = await payoutService.createInstructorPayoutRequest(
      req.body,
      req.actor,
    );
    res.status(201).json(request);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const getCourseHealth = async (req, res) => {
  try {
    const health = await dashboardService.getInstructorCourseHealth(req.actor);
    res.status(200).json(health);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};
