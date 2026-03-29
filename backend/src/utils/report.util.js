import PDFDocument from "pdfkit";

function formatNumber(value = 0) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function formatPercent(value = 0) {
  return `${Number(value || 0)}%`;
}

function formatDateTime(value = new Date()) {
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return "";
  }
}

function createPdfDocument(title = "Report") {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: true,
  });

  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const endPromise = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fontSize(20).text(title, { align: "center" });
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .fillColor("#64748b")
    .text(`Generated at: ${formatDateTime(new Date())}`, { align: "center" });
  doc.fillColor("#000000");
  doc.moveDown(1);

  return { doc, endPromise };
}

function addSectionTitle(doc, title) {
  doc.moveDown(0.4);
  doc.fontSize(14).fillColor("#111827").text(title);
  doc.moveDown(0.3);
}

function addMetricRow(doc, label, value, extra = "") {
  doc
    .fontSize(11)
    .fillColor("#111827")
    .text(`${label}: `, { continued: true })
    .fillColor("#2563eb")
    .text(String(value ?? ""), { continued: !!extra });

  if (extra) {
    doc.fillColor("#64748b").text(`   ${extra}`);
  } else {
    doc.text("");
  }

  doc.fillColor("#000000");
}

function addSimpleTable(doc, title, headers = [], rows = []) {
  addSectionTitle(doc, title);

  if (!rows.length) {
    doc.fontSize(10).fillColor("#64748b").text("No data available.");
    doc.fillColor("#000000");
    return;
  }

  doc.fontSize(10).fillColor("#111827").text(headers.join(" | "));
  doc.moveDown(0.25);

  rows.forEach((row) => {
    doc.fontSize(10).fillColor("#374151").text(row.join(" | "));
  });

  doc.fillColor("#000000");
  doc.moveDown(0.5);
}

export async function buildAdminDashboardPdf(dashboard = {}) {
  const { doc, endPromise } = createPdfDocument("Admin Dashboard Report");

  const stats = dashboard?.stats || {};
  const analytics = dashboard?.analytics || {};

  addSectionTitle(doc, "Summary");
  addMetricRow(doc, "Total Users", formatNumber(stats.totalUsers));
  addMetricRow(doc, "Total Students", formatNumber(stats.totalStudents));
  addMetricRow(doc, "Total Instructors", formatNumber(stats.totalInstructors));
  addMetricRow(doc, "Total Admins", formatNumber(stats.totalAdmins));
  addMetricRow(doc, "Active Users", formatNumber(stats.totalActiveUsers));
  addMetricRow(doc, "Inactive Users", formatNumber(stats.totalInactiveUsers));
  addMetricRow(doc, "Total Courses", formatNumber(stats.totalCourses));
  addMetricRow(doc, "Published Courses", formatNumber(stats.totalPublishedCourses));
  addMetricRow(doc, "Draft Courses", formatNumber(stats.totalDraftCourses));
  addMetricRow(doc, "Archived Courses", formatNumber(stats.totalArchivedCourses));
  addMetricRow(doc, "Total Enrollments", formatNumber(stats.totalEnrollments));
  addMetricRow(
    doc,
    "Completed Enrollments",
    formatNumber(stats.completedEnrollments)
  );
  addMetricRow(doc, "Estimated Revenue", formatNumber(stats.estimatedRevenue));
  addMetricRow(doc, "Completion Rate", formatPercent(stats.completionRate));
  addMetricRow(doc, "Average Progress", formatPercent(stats.averageProgress));
  addMetricRow(doc, "Average Course Rating", stats.averageCourseRating || 0);
  addMetricRow(doc, "Total Reviews", formatNumber(stats.totalReviews));
  addMetricRow(doc, "Total Certificates", formatNumber(stats.totalCertificates));

  addSimpleTable(
    doc,
    "Top Instructors",
    ["Name", "Courses", "Enrollments", "Revenue", "Rating"],
    (analytics.topInstructors || []).map((item) => [
      item.fullName || "Instructor",
      formatNumber(item.totalCourses),
      formatNumber(item.totalEnrollments),
      formatNumber(item.estimatedRevenue),
      `${item.averageRating || 0}/5`,
    ])
  );

  addSimpleTable(
    doc,
    "Top Categories",
    ["Category", "Courses", "Enrollments", "Revenue"],
    (analytics.topCategories || []).map((item) => [
      item.category || "General",
      formatNumber(item.totalCourses),
      formatNumber(item.totalEnrollments),
      formatNumber(item.estimatedRevenue),
    ])
  );

  addSimpleTable(
    doc,
    "Monthly Trend",
    ["Month", "Users", "Enrollments", "Revenue"],
    (analytics.monthlyTrend || []).map((item) => [
      item.label || item.key,
      formatNumber(item.users),
      formatNumber(item.enrollments),
      formatNumber(item.revenue),
    ])
  );

  doc.end();
  return endPromise;
}

export async function buildInstructorDashboardPdf(summary = {}) {
  const { doc, endPromise } = createPdfDocument("Instructor Dashboard Report");

  addSectionTitle(doc, "Summary");
  addMetricRow(doc, "Total Courses", formatNumber(summary.totalCourses));
  addMetricRow(doc, "Total Students", formatNumber(summary.totalStudents));
  addMetricRow(doc, "Total Enrollments", formatNumber(summary.totalEnrollments));
  addMetricRow(
    doc,
    "Completed Enrollments",
    formatNumber(summary.completedEnrollments)
  );
  addMetricRow(doc, "Completion Rate", formatPercent(summary.completionRate));
  addMetricRow(doc, "Average Progress", formatPercent(summary.averageProgress));
  addMetricRow(doc, "Total Materials", formatNumber(summary.totalMaterials));
  addMetricRow(doc, "Total Quizzes", formatNumber(summary.totalQuizzes));
  addMetricRow(
    doc,
    "Total Quiz Attempts",
    formatNumber(summary.totalQuizAttempts)
  );
  addMetricRow(doc, "Average Quiz Score", formatNumber(summary.averageQuizScore));
  addMetricRow(doc, "Quiz Pass Rate", formatPercent(summary.quizPassRate));
  addMetricRow(doc, "Total Assignments", formatNumber(summary.totalAssignments));
  addMetricRow(doc, "Total Submissions", formatNumber(summary.totalSubmissions));
  addMetricRow(
    doc,
    "Pending Assignment Grading",
    formatNumber(summary.pendingAssignmentGradingCount)
  );
  addMetricRow(
    doc,
    "Unread Conversations",
    formatNumber(summary.unreadConversationCount)
  );
  addMetricRow(doc, "Certificates", formatNumber(summary.certificateCount));
  addMetricRow(doc, "Estimated Revenue", formatNumber(summary.estimatedRevenue));

  addSimpleTable(
    doc,
    "Top Courses",
    ["Title", "Enrollments", "Revenue", "Quiz Score", "Completion"],
    (summary.topCourses || []).map((item) => [
      item.title || "Course",
      formatNumber(item.totalEnrollments),
      formatNumber(item.estimatedRevenue),
      formatNumber(item.averageQuizScore),
      formatPercent(item.completionRate),
    ])
  );

  addSimpleTable(
    doc,
    "Monthly Trend",
    ["Month", "Enrollments", "Quiz Attempts", "Submissions"],
    (summary.monthlyTrend || []).map((item) => [
      item.label || item.key,
      formatNumber(item.enrollments),
      formatNumber(item.quizAttempts),
      formatNumber(item.submissions),
    ])
  );

  doc.end();
  return endPromise;
}