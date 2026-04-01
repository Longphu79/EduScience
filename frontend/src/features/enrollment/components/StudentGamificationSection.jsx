import EnrollmentSectionCard from "./EnrollmentSectionCard";
import EnrollmentStatCard from "./EnrollmentStatCard";

function EventLabel({ item }) {
    const type = String(item?.type || "");

    if (type === "complete_lesson") return "Completed lesson";
    if (type === "complete_course") return "Completed course";
    if (type === "pass_quiz") return "Passed quiz";
    if (type === "submit_assignment") return "Submitted assignment";
    if (type === "earn_certificate") return "Earned certificate";

    return type || "Activity";
}

export default function StudentGamificationSection({
    gamification,
    events = [],
    pageClassName = "",
}) {
    const badges = Array.isArray(gamification?.badgeIds)
        ? gamification.badgeIds
        : [];

    return (
        <EnrollmentSectionCard
            title="Gamification"
            description="Track your XP, level, badges, and recent achievements."
            pageClassName={pageClassName}
        >
            <div className={`${pageClassName}__stats`}>
                <EnrollmentStatCard
                    label="XP Points"
                    value={gamification?.xp || 0}
                    hint="Earn XP by learning and completing tasks"
                    tone="amber"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Level"
                    value={gamification?.level || 1}
                    hint="Your current learner level"
                    tone="indigo"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Current Streak"
                    value={gamification?.currentStreak || 0}
                    hint="Consecutive active days"
                    tone="rose"
                    pageClassName={pageClassName}
                />
                <EnrollmentStatCard
                    label="Best Streak"
                    value={gamification?.bestStreak || 0}
                    hint="Your all-time best streak"
                    tone="emerald"
                    pageClassName={pageClassName}
                />
            </div>

            <div className="mt-6">
                <h3 className={`${pageClassName}__section-title`}>Badges</h3>
                {!badges.length ? (
                    <div className={`${pageClassName}__empty-soft`}>
                        No badges yet. Keep learning to unlock achievements.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-4">
                        {badges.map((badge, index) => (
                            <div
                                key={badge?._id || badge?.code || index}
                                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="text-2xl">
                                    {badge?.icon || "🏆"}
                                </div>
                                <div className="mt-2 text-lg font-bold text-slate-900">
                                    {badge?.title || "Badge"}
                                </div>
                                <div className="mt-1 text-sm text-slate-500">
                                    {badge?.description || ""}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-6">
                <h3 className={`${pageClassName}__section-title`}>
                    Recent Achievements
                </h3>
                {!events.length ? (
                    <div className={`${pageClassName}__empty-soft`}>
                        No recent XP events yet.
                    </div>
                ) : (
                    <div className="grid gap-3 mt-4">
                        {events.map((item, index) => (
                            <div
                                key={item?._id || index}
                                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                            >
                                <div>
                                    <div className="font-semibold text-slate-900">
                                        <EventLabel item={item} />
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {item?.createdAt
                                            ? new Date(
                                                  item.createdAt,
                                              ).toLocaleString("vi-VN")
                                            : "N/A"}
                                    </div>
                                </div>

                                <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                                    +{item?.xpEarned || 0} XP
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </EnrollmentSectionCard>
    );
}
