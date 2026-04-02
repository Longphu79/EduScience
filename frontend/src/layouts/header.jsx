import {
    LogOut,
    User,
    LayoutDashboard,
    PencilLine,
    ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/state/useAuth";
import { useCartCount } from "../features/cart/hooks/useCartCount";
import MessageCenter from "../features/chat/components/MessageCenter";
import {
    chatUnwrap,
    getMyUnreadSummary,
    getChatSocket,
} from "../features/chat/services/chat.service";
import BrandLogo from "../shared/components/header/BrandLogo";
import DesktopNav from "../shared/components/header/DesktopNav";
import HeaderAuthActions from "../shared/components/header/HeaderAuthActions";
import HeaderCartButton from "../shared/components/header/HeaderCartButton";
import HeaderMessageButton from "../shared/components/header/HeaderMessageButton";
import HeaderUserMenu from "../shared/components/header/HeaderUserMenu";
import MobileMenu from "../shared/components/header/MobileMenu";
import "../shared/components/header/header.css";

const baseNavItems = [
    { label: "Features", to: "/features" },
    { label: "Courses", to: "/courses" },
    { label: "About Us", to: "/aboutus" },
];

function normalizeUserRole(user) {
    const rawRole =
        user?.role?.name ||
        user?.role?.code ||
        user?.role?.role ||
        user?.role ||
        user?.userRole ||
        "";

    const normalized = String(rawRole).trim().toLowerCase();

    if (normalized === "administrator") return "admin";
    return normalized;
}

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMessageCenterOpen, setIsMessageCenterOpen] = useState(false);
    const [conversationCount, setConversationCount] = useState(0);

    const { user, isAuthenticated, booting, logout } = useAuth();
    const { cartCount } = useCartCount();

    const location = useLocation();
    const navigate = useNavigate();

    const currentUserId = user?._id || user?.id || user?.userId || null;
    const userRole = normalizeUserRole(user);

    const isInstructor = isAuthenticated && userRole === "instructor";
    const isStudent = isAuthenticated && userRole === "student";
    const isAdmin = isAuthenticated && userRole === "admin";
    const canUseChat = isStudent || isInstructor;

    const navItems = useMemo(() => {
        const items = [...baseNavItems];

        if (isStudent) {
            items.push({ label: "My Courses", to: "/my-courses" });
        }

        if (isInstructor) {
            items.push({ label: "Instructor", to: "/instructor/courses" });
        }

        if (isAdmin) {
            items.push({ label: "Admin", to: "/admin/dashboard" });
        }

        return items;
    }, [isInstructor, isStudent, isAdmin]);

    useEffect(() => {
        setMobileOpen(false);
        setIsUserMenuOpen(false);
        setIsMessageCenterOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        async function loadUnreadCount() {
            if (!isAuthenticated || !canUseChat) {
                setConversationCount(0);
                return;
            }

            try {
                const response = await getMyUnreadSummary();
                const data = chatUnwrap(response);
                setConversationCount(Number(data?.unreadMessages || 0));
            } catch {
                setConversationCount(0);
            }
        }

        loadUnreadCount();
    }, [isAuthenticated, canUseChat, location.pathname]);

    useEffect(() => {
        if (!isAuthenticated || !canUseChat) {
            setConversationCount(0);
            return;
        }

        const socket = getChatSocket();

        const handleUnreadUpdated = (payload) => {
            setConversationCount(Number(payload?.unreadMessages || 0));
        };

        socket.on("chat:unread-updated", handleUnreadUpdated);

        return () => {
            socket.off("chat:unread-updated", handleUnreadUpdated);
        };
    }, [isAuthenticated, canUseChat]);

    async function handleLogout() {
        try {
            await logout?.();
        } finally {
            setIsUserMenuOpen(false);
            setIsMessageCenterOpen(false);
            navigate("/");
        }
    }

    if (booting) return null;

    return (
        <header className="header-shell sticky top-0 z-[80] isolate border-b border-slate-200/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
            <div className="header-shell__inner mx-auto grid h-[74px] max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-4 sm:px-6 lg:px-8">
                <div className="header-brand-zone relative z-[120] flex min-w-fit items-center">
                    <BrandLogo onClick={() => navigate("/")} />
                </div>

                <DesktopNav navItems={navItems} />

                <div className="header-actions relative z-20 hidden min-w-fit items-center justify-end gap-3 md:flex">
                    {!isAuthenticated ? (
                        <HeaderAuthActions />
                    ) : (
                        <>
                            {isStudent ? (
                                <HeaderCartButton cartCount={cartCount} />
                            ) : null}

                            {canUseChat ? (
                                <div className="relative shrink-0">
                                    <HeaderMessageButton
                                        conversationCount={conversationCount}
                                        onClick={() => {
                                            setIsMessageCenterOpen(
                                                (prev) => !prev,
                                            );
                                            setIsUserMenuOpen(false);
                                        }}
                                    />

                                    <MessageCenter
                                        open={isMessageCenterOpen}
                                        currentUserId={currentUserId}
                                        onClose={() =>
                                            setIsMessageCenterOpen(false)
                                        }
                                        onOpenConversation={(conversation) => {
                                            window.dispatchEvent(
                                                new CustomEvent(
                                                    "open-chat-conversation-dock",
                                                    {
                                                        detail: {
                                                            conversation,
                                                        },
                                                    },
                                                ),
                                            );
                                            setIsMessageCenterOpen(false);
                                        }}
                                    />
                                </div>
                            ) : null}

                            <HeaderUserMenu
                                open={isUserMenuOpen}
                                user={user}
                                userRole={userRole}
                                isStudent={isStudent}
                                isInstructor={isInstructor}
                                isAdmin={isAdmin}
                                onToggle={() => {
                                    setIsUserMenuOpen((prev) => !prev);
                                    setIsMessageCenterOpen(false);
                                }}
                                onClose={() => setIsUserMenuOpen(false)}
                                onNavigate={navigate}
                                onLogout={handleLogout}
                                icons={{
                                    logout: LogOut,
                                    user: User,
                                    dashboard: LayoutDashboard,
                                    edit: PencilLine,
                                    admin: ShieldCheck,
                                }}
                            />
                        </>
                    )}
                </div>

                <MobileMenu
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                    navItems={navItems}
                    isAuthenticated={isAuthenticated}
                    isStudent={isStudent}
                    isInstructor={isInstructor}
                    isAdmin={isAdmin}
                    cartCount={cartCount}
                    onLogout={handleLogout}
                />
            </div>
        </header>
    );
}