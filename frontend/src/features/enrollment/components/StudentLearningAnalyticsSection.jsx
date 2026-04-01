import EnrollmentSectionCard from "./EnrollmentSectionCard";
import EnrollmentStatCard from "./EnrollmentStatCard";

export default function StudentLearningAnalyticsSection({
    analytics,
    pageClassName = "",
}) {
    return (
        <EnrollmentSectionCard
            title="Learning Analytics"
            description="Your learning performance overview, study momentum, and completion insights."
            pageClassName={pageClassName}
        >
            <div className={`${pageClassName}__stats`}>
                <EnrollmentStatCard
                    label="Completion Rate"
                    value={`${analytics?.completionRate || 0}%`}
                    hint={`${analytics?.completedCourses || 0}/${analytics?.totalCourses || 0} courses completed`}
                    tone="emerald"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Average Progress"
                    value={`${analytics?.averageProgress || 0}%`}
                    hint="Across all enrolled courses"
                    tone="indigo"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Learning Hours"
                    value={analytics?.estimatedLearningHours || 0}
                    hint={`${analytics?.estimatedLearningMinutes || 0} estimated minutes`}
                    tone="amber"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Certificates Earned"
                    value={analytics?.certificateCount || 0}
                    hint="Generated after course completion"
                    tone="rose"
                    pageClassName={pageClassName}
                />
            </div>

            <div
                className={`${pageClassName}__stats ${pageClassName}__stats--three`}
            >
                <EnrollmentStatCard
                    label="Quiz Attempts"
                    value={analytics?.totalQuizAttempts || 0}
                    hint={`Avg score: ${analytics?.averageQuizScore || 0}`}
                    tone="indigo"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Quiz Pass Rate"
                    value={`${analytics?.quizPassRate || 0}%`}
                    hint="Based on submitted quiz attempts"
                    tone="emerald"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Assignments Submitted"
                    value={analytics?.totalAssignmentsSubmitted || 0}
                    hint={`${analytics?.gradedAssignmentsCount || 0} graded`}
                    tone="slate"
                    pageClassName={pageClassName}
                />
            </div>

            <div
                className={`${pageClassName}__stats ${pageClassName}__stats--three`}
            >
                <EnrollmentStatCard
                    label="Current Streak 🔥"
                    value={analytics?.currentStreak || 0}
                    hint="Consecutive active learning days"
                    tone="rose"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Best Streak"
                    value={analytics?.bestStreak || 0}
                    hint={`${analytics?.activeDays || 0} active days in total`}
                    tone="amber"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Last Active"
                    value={analytics?.lastActiveDate || "N/A"}
                    hint="Most recent learning activity"
                    tone="slate"
                    pageClassName={pageClassName}
                />
            </div>
        </EnrollmentSectionCard>
    );
}
