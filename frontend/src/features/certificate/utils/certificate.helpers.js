export function formatDate(value, fallback = "N/A") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("vi-VN");
}

export function formatDateTime(value, fallback = "N/A") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("vi-VN");
}

export function getDisplayStudentName(certificate, user = null) {
  return (
    certificate?.studentName ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    "Student"
  );
}

export function getCertificateLink(code) {
  if (!code || typeof window === "undefined") return "";
  return `${window.location.origin}/certificate/${code}`;
}

export function normalizeCertificate(item) {
  if (!item) return null;

  return {
    ...item,
    _id: item?._id || item?.id || "",
    certificateCode: item?.certificateCode || "",
    courseTitle: item?.courseTitle || "N/A",
    instructorName: item?.instructorName || "Instructor",
    studentName: item?.studentName || "",
    completionDate: item?.completionDate || "",
    issuedAt: item?.issuedAt || "",
  };
}