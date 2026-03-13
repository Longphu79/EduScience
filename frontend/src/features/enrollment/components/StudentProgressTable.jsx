import React from "react";
import { Link } from "react-router-dom";

export default function StudentProgressTable({ students = [], courseId }) {
  if (!students.length) return <p>Chưa có học viên.</p>;

  return (
    <table width="100%" border="1" cellPadding="8">
      <thead>
        <tr>
          <th>Student</th>
          <th>Email</th>
          <th>Progress</th>
          <th>Completed</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {students.map((item) => (
          <tr key={item._id}>
            <td>
              {item.studentId?.fullName ||
                item.studentId?.name ||
                item.studentId?.username ||
                item.studentId?.email}
            </td>
            <td>{item.studentId?.email}</td>
            <td>{item.progress}%</td>
            <td>{item.completed ? "Yes" : "No"}</td>
            <td>
              <Link
                to={`/instructor/courses/${courseId}/students/${item.studentId?._id}`}
              >
                View Detail
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}