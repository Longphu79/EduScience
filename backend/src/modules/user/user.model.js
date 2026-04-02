import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },

    fullName: {
      type: String,
      trim: true,
      default: "",
    },

    avatarUrl: {
      type: String,
      default:
        "https://i.pinimg.com/1200x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg",
    },

    coverImageUrl: {
      type: String,
      default: "",
    },

    headline: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    expertise: {
      type: [String],
      default: [],
    },

    learningGoals: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Ép Mongoose bỏ model User cũ nếu đang giữ schema cũ
if (mongoose.connection.models.User) {
  delete mongoose.connection.models.User;
}

const User = mongoose.model("User", userSchema);

export default User;