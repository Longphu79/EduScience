import mongoose from "mongoose";

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    submissionText: { type: String, default: "" },
    fileUrls: [{ type: String }],

    submittedAt: { type: Date, default: Date.now },
    resubmittedAt: { type: Date, default: null },

    status: {
      type: String,
      enum: ["submitted", "resubmitted", "graded", "overdue"],
      default: "submitted",
    },

    grade: { type: Number, default: null },
    feedback: { type: String, default: "" },
    gradedAt: { type: Date, default: null },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

assignmentSubmissionSchema.index(
  { assignmentId: 1, studentId: 1 },
  { unique: true }
);

const AssignmentSubmission = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);

export default AssignmentSubmission;