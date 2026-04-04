import { Suspense } from "react";

import { CourseAuthoringWorkspace } from "@/components/course-authoring-workspace";

export default function InstructorAuthoringPage() {
  return (
    <Suspense fallback={null}>
      <CourseAuthoringWorkspace role="instructor" />
    </Suspense>
  );
}
