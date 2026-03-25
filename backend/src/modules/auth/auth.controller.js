import * as authService from "./auth.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const result = await authService.register({
      username,
      email,
      password,
      role,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Register successfully",
      data: result,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 400,
      message: err.message || "Register failed",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await authService.login({
      username,
      password,
    });

    return sendSuccess(res, {
      message: "Login successfully",
      data: result,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 400,
      message: err.message || "Login failed",
    });
  }
};