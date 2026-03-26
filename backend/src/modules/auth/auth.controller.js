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

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const result = await authService.forgotPassword({ email });

        return sendSuccess(res, {
            message: result.message,
            data: result,
        });
    } catch (err) {
        return sendError(res, {
            statusCode: 400,
            message: err.message || "Forgot password failed",
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const result = await authService.resetPassword({
            token,
            password,
        });

        return sendSuccess(res, {
            message: result.message,
            data: result,
        });
    } catch (err) {
        return sendError(res, {
            statusCode: 400,
            message: err.message || "Reset password failed",
        });
    }
};
