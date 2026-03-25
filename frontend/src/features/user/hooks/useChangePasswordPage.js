import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/state/useAuth";
import { changeUserPassword } from "../services/user.service";
import {
  getCurrentUserId,
  getPasswordStrengthText,
  validatePasswordForm,
} from "../utils/user.helpers";

export default function useChangePasswordPage() {
  const navigate = useNavigate();
  const { user, booting } = useAuth();

  const currentUserId = getCurrentUserId(user);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const strengthText = useMemo(() => {
    return getPasswordStrengthText(form.newPassword);
  }, [form.newPassword]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }, []);

  const handleCancel = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const nextErrors = validatePasswordForm(form);
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length) {
        setToast({
          message: "Please fix the highlighted fields",
          kind: "error",
        });
        return;
      }

      try {
        setSubmitting(true);

        await changeUserPassword(currentUserId, {
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        });

        setToast({
          message: "Password updated successfully",
          kind: "success",
        });

        setForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          navigate("/profile");
        }, 700);
      } catch (error) {
        setToast({
          message: error?.message || "Failed to update password",
          kind: "error",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [currentUserId, form, navigate]
  );

  return {
    booting,
    form,
    errors,
    strengthText,
    submitting,
    toast,
    setToast,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}