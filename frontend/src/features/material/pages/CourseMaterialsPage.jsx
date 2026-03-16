import React from "react";
import { useParams } from "react-router-dom";
import MaterialsTab from "../components/MaterialsTab";

export default function CourseMaterialsPage() {
  const { courseId } = useParams();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <MaterialsTab courseId={courseId} />
    </div>
  );
}