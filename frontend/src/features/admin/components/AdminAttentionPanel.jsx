import { Link } from "react-router-dom";
import { getAdminInactiveUsersCount } from "../utils/admin.helpers";
import "../styles/admin-attention-panel.css";

function AttentionItem({ title, description, to, tone = "slate" }) {
    return (
        <Link
            to={to}
            className={`admin-attention-item admin-attention-item--${tone}`}
        >
            <div className="admin-attention-item__title">{title}</div>
            <div className="admin-attention-item__description">
                {description}
            </div>
        </Link>
    );
}

export default function AdminAttentionPanel({ stats = {} }) {
    const cards = [];
    const inactiveUsers = getAdminInactiveUsersCount(stats);

    // 1. ƯU TIÊN SỐ 1: Các yêu cầu rút tiền đang chờ (Màu tím/violet)
    if ((stats.pendingWithdrawals || 0) > 0) {
        cards.push({
            title: `${stats.pendingWithdrawals} pending withdrawals`,
            description:
                "Instructors and students are waiting for their payouts. Review and process now.",
            to: "/admin/withdrawals",
            tone: "violet", // Bạn nhớ thêm CSS cho tone này nhé
        });
    }

    // 2. Khóa học nháp
    if ((stats.totalDraftCourses || 0) > 0) {
        cards.push({
            title: `${stats.totalDraftCourses} draft courses`,
            description:
                "Review courses that are not published yet and may need moderation or completion.",
            to: "/admin/courses?status=draft",
            tone: "amber",
        });
    }

    // 3. Người dùng bị vô hiệu hóa
    if (inactiveUsers > 0) {
        cards.push({
            title: `${inactiveUsers} inactive users`,
            description:
                "Inspect disabled or deactivated accounts and verify whether they should be restored.",
            to: "/admin/users?isActive=false",
            tone: "red",
        });
    }

    // 4. Khóa học đã xuất bản
    if ((stats.totalPublishedCourses || 0) > 0) {
        cards.push({
            title: `${stats.totalPublishedCourses} published courses`,
            description:
                "Review live courses currently visible on the platform.",
            to: "/admin/courses?status=published",
            tone: "emerald",
        });
    }

    // 5. Ghi danh hoàn tất
    if ((stats.completedEnrollments || 0) > 0) {
        cards.push({
            title: `${stats.completedEnrollments} completed enrollments`,
            description:
                "Track healthy course completion volume across the platform.",
            to: "/admin/dashboard",
            tone: "indigo",
        });
    }

    if (!cards.length) {
        return (
            <div className="admin-attention-empty">
                <h3 className="admin-attention-empty__title">
                    No alerts right now
                </h3>
                <p className="admin-attention-empty__description">
                    Attention-worthy items will appear here as the platform
                    grows.
                </p>
            </div>
        );
    }

    return (
        <div className="admin-attention-grid">
            {cards.map((card, index) => (
                <AttentionItem key={`${card.title}-${index}`} {...card} />
            ))}
        </div>
    );
}
