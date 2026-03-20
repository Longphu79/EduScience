import { sendError } from "../../utils/response.js";

function toBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") return value;

  const normalized = String(value).trim().toLowerCase();

  if (normalized === "true") return true;
  if (normalized === "false") return false;

  return defaultValue;
}

function toNullableDate(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "INVALID_DATE";
  }

  return date;
}

function toPositiveNumber(value, fallback = 100) {
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return fallback;
  return num;
}

function normalizeString(value = "") {
  return typeof value === "string" ? value.trim() : "";
}

export function validateCreateAssignment(req, res, next) {
  try {
    const title = normalizeString(req.body?.title);
    const description = normalizeString(req.body?.description);
    const courseId = normalizeString(req.body?.courseId);
    const lessonId = normalizeString(req.body?.lessonId);
    const dueDate = toNullableDate(req.body?.dueDate);
    const maxScore = toPositiveNumber(req.body?.maxScore, 100);
    const allowResubmit = toBoolean(req.body?.allowResubmit, true);
    const isPublished = toBoolean(req.body?.isPublished, true);

    if (!courseId) {
      return sendError(res, {
        statusCode: 400,
        message: "courseId is required",
      });
    }

    if (!title) {
      return sendError(res, {
        statusCode: 400,
        message: "title is required",
      });
    }

    if (title.length > 200) {
      return sendError(res, {
        statusCode: 400,
        message: "title must be at most 200 characters",
      });
    }

    if (description.length > 5000) {
      return sendError(res, {
        statusCode: 400,
        message: "description must be at most 5000 characters",
      });
    }

    if (dueDate === "INVALID_DATE") {
      return sendError(res, {
        statusCode: 400,
        message: "dueDate is invalid",
      });
    }

    req.body.title = title;
    req.body.description = description;
    req.body.courseId = courseId;
    req.body.lessonId = lessonId || null;
    req.body.dueDate = dueDate;
    req.body.maxScore = maxScore;
    req.body.allowResubmit = allowResubmit;
    req.body.isPublished = isPublished;

    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateUpdateAssignment(req, res, next) {
  try {
    if (req.body?.title !== undefined) {
      const title = normalizeString(req.body.title);

      if (!title) {
        return sendError(res, {
          statusCode: 400,
          message: "title cannot be empty",
        });
      }

      if (title.length > 200) {
        return sendError(res, {
          statusCode: 400,
          message: "title must be at most 200 characters",
        });
      }

      req.body.title = title;
    }

    if (req.body?.description !== undefined) {
      const description = normalizeString(req.body.description);

      if (description.length > 5000) {
        return sendError(res, {
          statusCode: 400,
          message: "description must be at most 5000 characters",
        });
      }

      req.body.description = description;
    }

    if (req.body?.dueDate !== undefined) {
      const dueDate = toNullableDate(req.body.dueDate);

      if (dueDate === "INVALID_DATE") {
        return sendError(res, {
          statusCode: 400,
          message: "dueDate is invalid",
        });
      }

      req.body.dueDate = dueDate;
    }

    if (req.body?.maxScore !== undefined) {
      const maxScore = Number(req.body.maxScore);

      if (Number.isNaN(maxScore) || maxScore < 0) {
        return sendError(res, {
          statusCode: 400,
          message: "maxScore must be a number greater than or equal to 0",
        });
      }

      req.body.maxScore = maxScore;
    }

    if (req.body?.allowResubmit !== undefined) {
      req.body.allowResubmit = toBoolean(req.body.allowResubmit, true);
    }

    if (req.body?.isPublished !== undefined) {
      req.body.isPublished = toBoolean(req.body.isPublished, true);
    }

    if (req.body?.lessonId !== undefined) {
      req.body.lessonId = normalizeString(req.body.lessonId) || null;
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export function validateSubmitAssignment(req, res, next) {
  try {
    const submissionText = normalizeString(req.body?.submissionText);
    const rawFileUrls = normalizeString(req.body?.fileUrls);

    const hasUploadedFiles =
      Array.isArray(req.files?.files) && req.files.files.length > 0;

    const hasFileUrls = !!rawFileUrls;
    const hasSubmissionText = !!submissionText;

    if (!hasSubmissionText && !hasFileUrls && !hasUploadedFiles) {
      return sendError(res, {
        statusCode: 400,
        message: "submissionText, fileUrls or uploaded files are required",
      });
    }

    if (submissionText.length > 10000) {
      return sendError(res, {
        statusCode: 400,
        message: "submissionText must be at most 10000 characters",
      });
    }

    req.body.submissionText = submissionText;
    req.body.fileUrls = rawFileUrls;

    return next();
  } catch (error) {
    return next(error);
  }
}