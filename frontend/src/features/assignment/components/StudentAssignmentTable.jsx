import {
  getLatestSubmissionInfo,
  getSubmissionId,
} from "../utils/assignment.helpers";
import "../styles/assignment-components.css";

export default function StudentAssignmentTable({ submissions = [] }) {
  if (!submissions.length) {
    return (
      <div className="student-assignment-table__empty">Chưa có bài nộp.</div>
    );
  }

  return (
    <div className="student-assignment-table">
      <table className="student-assignment-table__table">
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
            <tr key={getSubmissionId(item)}>
              <td>{item.assignmentId?.title || "N/A"}</td>
              <td>{item.status}</td>
              <td>{item.grade ?? "Not graded"}</td>
              <td>{getLatestSubmissionInfo(item)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}