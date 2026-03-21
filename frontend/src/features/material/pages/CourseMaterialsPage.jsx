import React from "react";
import { useParams } from "react-router-dom";
import MaterialsTab from "../components/MaterialsTab";
import "../styles/course-materials-page.css";

export default function CourseMaterialsPage() {
  const { courseId } = useParams();

  return (
    <div className="course-materials-page">
      <div className="course-materials-page__container">
        <MaterialsTab courseId={courseId} />
      </div>
    </div>
  );
}