import { sendError, sendSuccess } from "../../utils/response.js";

export const uploadMaterialFile = async (req, res) => {
    try {
        if (!req.file) {
            return sendError(res, {
                statusCode: 400,
                message: "File is required",
            });
        }

        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/materials/${req.file.filename}`;

        return sendSuccess(res, {
            statusCode: 201,
            message: "Upload file successfully",
            data: {
                fileUrl,
                fileName: req.file.originalname,
                fileType: req.file.mimetype || "",
                fileSize: Number(req.file.size || 0),
            },
        });
    } catch (err) {
        return sendError(res, {
            statusCode: 400,
            message: err.message || "Upload failed",
        });
    }
};
