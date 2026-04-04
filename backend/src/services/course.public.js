export const publicInstructorPopulate = {
  path: "instructorId",
  select: "name avatarUrl bio rating totalStudents expertise",
};

export const publicCourseSelect =
  "title slug shortDescription description category thumbnail previewVideo level language duration price salePrice isFree rating totalReviews totalEnrollments totalLessons status createdAt updatedAt instructorId";
