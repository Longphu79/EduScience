export default function InstructorCoursesStats({ dashboard, formatNumber }) {
    const stats = [
        {
            label: "Total Courses",
            value: formatNumber(dashboard.totalCourses),
            subtitle: `${formatNumber(dashboard.publishedCourses)} published`,
        },
        {
            label: "Total Students",
            value: formatNumber(dashboard.totalStudents),
            subtitle: "Across all courses",
        },
        {
            label: "Quiz Attempts",
            value: formatNumber(dashboard.totalQuizAttempts),
        },
        {
            label: "Assignments",
            value: formatNumber(dashboard.totalAssignmentSubmissions),
        },
    ];

    return (
        <div className="instructor-courses-page__stats-grid">
            {stats.map((item, i) => (
                <div key={i} className="instructor-courses-page__stat-card">
                    <div className="instructor-courses-page__stat-label">
                        {item.label}
                    </div>
                    <div className="instructor-courses-page__stat-value">
                        {item.value}
                    </div>
                    {item.subtitle ? (
                        <div className="instructor-courses-page__stat-subtitle">
                            {item.subtitle}
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
}
