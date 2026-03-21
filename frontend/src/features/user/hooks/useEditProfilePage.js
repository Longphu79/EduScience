import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/state/useAuth";
import {
  updateInstructorProfile,
  updateStudentProfile,
  updateUserProfile,
  uploadUserAvatar,
  uploadUserCover,
} from "../services/user.service";
import {
  DEFAULT_AVATAR,
  buildLinesFromArray,
  getCurrentUserId,
  getRoleMeta,
  getSafeImage,
  normalizeUserItem,
  parseLinesToArray,
  userUnwrap,
  validateProfileForm,
} from "../utils/user.helpers";

export default function useEditProfilePage() {
  const navigate = useNavigate();
  const { user, booting, updateCurrentUser } = useAuth();

  const normalizedUser = useMemo(() => normalizeUserItem(user || {}), [user]);
  const currentUserId = getCurrentUserId(normalizedUser);

  const role = normalizedUser?.role || "student";
  const isInstructor = role === "instructor";
  const isAdmin = role === "admin";
  const roleMeta = getRoleMeta(role);

  const [form, setForm] = useState({
    fullName: "",
    avatarUrl: "",
    coverImageUrl: "",
    headline: "",
    bio: "",
    phone: "",
    expertiseText: "",
    learningGoalsText: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  useEffect(() => {
    if (!normalizedUser?._id) return;

    setForm({
      fullName: normalizedUser?.fullName || "",
      avatarUrl: normalizedUser?.avatarUrl || "",
      coverImageUrl: normalizedUser?.coverImageUrl || "",
      headline: normalizedUser?.headline || "",
      bio: normalizedUser?.bio || "",
      phone: normalizedUser?.phone || "",
      expertiseText: buildLinesFromArray(normalizedUser?.expertise),
      learningGoalsText: buildLinesFromArray(normalizedUser?.learningGoals),
    });
  }, [normalizedUser]);

  useEffect(() => {
    return () => {
      if (avatarFile?.preview) URL.revokeObjectURL(avatarFile.preview);
      if (coverFile?.preview) URL.revokeObjectURL(coverFile.preview);
    };
  }, [avatarFile, coverFile]);

  const avatarPreview = useMemo(() => {
    return avatarFile?.preview || getSafeImage(form.avatarUrl) || DEFAULT_AVATAR;
  }, [avatarFile, form.avatarUrl]);

  const coverPreview = useMemo(() => {
    return (
      coverFile?.preview ||
      getSafeImage(form.coverImageUrl) ||
      roleMeta.coverFallback
    );
  }, [coverFile, form.coverImageUrl, roleMeta.coverFallback]);

  const previewItems = useMemo(() => {
    if (isAdmin) return [];
    return isInstructor
      ? parseLinesToArray(form.expertiseText)
      : parseLinesToArray(form.learningGoalsText);
  }, [form.expertiseText, form.learningGoalsText, isAdmin, isInstructor]);

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

  const handleAvatarFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (avatarFile?.preview) URL.revokeObjectURL(avatarFile.preview);

      setAvatarFile({
        file,
        preview: URL.createObjectURL(file),
      });
    },
    [avatarFile]
  );

  const handleCoverFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (coverFile?.preview) URL.revokeObjectURL(coverFile.preview);

      setCoverFile({
        file,
        preview: URL.createObjectURL(file),
      });
    },
    [coverFile]
  );

  const handleCancel = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const nextErrors = validateProfileForm(form, isInstructor, isAdmin);
      setErrors(nextErrors);

      if (Object.keys(nextErrors).length > 0) {
        setToast({
          message: "Please fix the highlighted fields",
          kind: "error",
        });
        return;
      }

      try {
        setSubmitting(true);

        let nextAvatarUrl = getSafeImage(form.avatarUrl) || "";
        let nextCoverImageUrl = getSafeImage(form.coverImageUrl) || "";

        if (avatarFile?.file) {
          const avatarResponse = await uploadUserAvatar(
            currentUserId,
            avatarFile.file
          );
          const avatarUser = normalizeUserItem(userUnwrap(avatarResponse));
          nextAvatarUrl = avatarUser?.avatarUrl || nextAvatarUrl;
        }

        if (coverFile?.file) {
          const coverResponse = await uploadUserCover(
            currentUserId,
            coverFile.file
          );
          const coverUser = normalizeUserItem(userUnwrap(coverResponse));
          nextCoverImageUrl = coverUser?.coverImageUrl || nextCoverImageUrl;
        }

        const payload = {
          fullName: form.fullName.trim(),
          avatarUrl: nextAvatarUrl,
          coverImageUrl: nextCoverImageUrl,
          headline: form.headline.trim(),
          bio: form.bio.trim(),
          phone: form.phone.trim(),
          expertise: parseLinesToArray(form.expertiseText),
          learningGoals: parseLinesToArray(form.learningGoalsText),
        };

        let response;

        if (isInstructor) {
          response = await updateInstructorProfile(currentUserId, payload);
        } else if (role === "student") {
          response = await updateStudentProfile(currentUserId, payload);
        } else {
          response = await updateUserProfile(currentUserId, payload);
        }

        const updatedUser = normalizeUserItem(userUnwrap(response));

        if (updatedUser?._id) {
          updateCurrentUser(updatedUser);
        }

        setToast({
          message: "Profile updated successfully",
          kind: "success",
        });

        setTimeout(() => {
          navigate("/profile");
        }, 700);
      } catch (error) {
        setToast({
          message: error?.message || "Failed to update profile",
          kind: "error",
        });
      } finally {
        setSubmitting(false);
      }
    },
    [
      avatarFile,
      coverFile,
      currentUserId,
      form,
      isAdmin,
      isInstructor,
      navigate,
      role,
      updateCurrentUser,
    ]
  );

  return {
    booting,
    role,
    isInstructor,
    isAdmin,
    roleMeta,
    form,
    errors,
    submitting,
    toast,
    setToast,
    avatarPreview,
    coverPreview,
    previewItems,
    handleChange,
    handleAvatarFileChange,
    handleCoverFileChange,
    handleSubmit,
    handleCancel,
  };
}