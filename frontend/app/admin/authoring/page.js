import { Suspense } from "react";

import { CourseAuthoringWorkspace } from "@/components/course-authoring-workspace";

export default function AdminAuthoringPage() {
  return (
    <Suspense fallback={null}>
      <CourseAuthoringWorkspace role="admin" />
    </Suspense>
  );
}
