import React from "react";

export default function StudentAssignmentTable({ submissions = [] }) {
  if (!submissions.length) return <p>Chưa có bài nộp.</p>;

  return (
    <table width="100%" border="1" cellPadding="8">
      <thead>
        <tr>
          <th>Assignment</th>
          <th>Status</th>
          <th>Grade</th>
          <th>Submitted At</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((item) => (
          <tr key={item._id}>
            <td>{item.assignmentId?.title}</td>
            <td>{item.status}</td>
            <td>{item.grade ?? "Not graded"}</td>
            <td>
              {item.submittedAt
                ? new Date(item.submittedAt).toLocaleString()
                : item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : "N/A"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}