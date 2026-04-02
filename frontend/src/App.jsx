import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Outlet,
} from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import Home from "./pages/home/home";

import AllCoursesPage from "./features/course/pages/AllCoursesPage";
import CourseDetailPage from "./features/course/pages/CourseDetailPage";
import CreateCoursePage from "./features/course/pages/CreateCoursePage";
import EditCoursePage from "./features/course/pages/EditCoursePage";
import InstructorCoursesPage from "./features/course/pages/InstructorCoursesPage";

import LearnCoursePage from "./features/enrollment/pages/LearnCoursePage";
import MyCoursesPage from "./features/enrollment/pages/MyCoursesPage";
import InstructorStudentsPage from "./features/enrollment/pages/InstructorStudentsPage";
import InstructorStudentDetailPage from "./features/enrollment/pages/InstructorStudentDetailPage";
import StudentDashboardPage from "./features/enrollment/pages/StudentDashboardPage";
import InstructorDashboardPage from "./features/enrollment/pages/InstructorDashboardPage";

import CourseMaterialsPage from "./features/material/pages/CourseMaterialsPage";
import InstructorMaterialManagePage from "./features/material/pages/InstructorMaterialManagePage";
import InstructorLessonManagePage from "./features/lesson/pages/InstructorLessonManagePage";

import QuizPage from "./features/quiz/pages/QuizPage";
import InstructorQuizManagePage from "./features/quiz/pages/InstructorQuizManagePage";
import InstructorQuizCreatePage from "./features/quiz/pages/InstructorQuizCreatePage";
import InstructorQuizEditPage from "./features/quiz/pages/InstructorQuizEditPage";
import InstructorQuizResultsPage from "./features/quiz/pages/InstructorQuizResultsPage";

import AssignmentPage from "./features/assignment/pages/AssignmentPage";
import InstructorAssignmentManagePage from "./features/assignment/pages/InstructorAssignmentManagePage";
import InstructorAssignmentResultsPage from "./features/assignment/pages/InstructorAssignmentResultsPage";

import CourseChatPage from "./features/chat/pages/CourseChatPage";
import CourseCertificatePage from "./features/certificate/pages/CourseCertificatePage";
import PublicCertificatePage from "./features/certificate/pages/PublicCertificatePage";
import CartPage from "./features/cart/pages/CartPage";
import WalletPage from "./features/wallet/pages/WalletPage";
import TransactionPage from "./features/transaction/pages/TransactionPage";
import DepositPage from "./features/wallet/pages/DepositPage";

import ProfilePage from "./features/user/pages/ProfilePage";
import UserProfilePage from "./features/user/pages/UserProfilePage";
import EditProfilePage from "./features/user/pages/EditProfilePage";
import ChangePasswordPage from "./features/user/pages/ChangePasswordPage";

import AdminDashboardPage from "./features/admin/pages/AdminDashboardPage";
import AdminUsersPage from "./features/admin/pages/AdminUsersPage";
import AdminCoursesPage from "./features/admin/pages/AdminCoursesPage";
import AdminUserDetailPage from "./features/admin/pages/AdminUserDetailPage";
import AdminCourseDetailPage from "./features/admin/pages/AdminCourseDetailPage";
import AdminWithdrawalsPage from "./features/admin/pages/AdminWithdrawalsPage";
import AdminDepositManager from "./features/admin/pages/DepositManager";
import CourseReviewsPage from "./features/review/pages/CourseReviewsPage";

import FeaturesPage from "./pages/features/Features";
import AboutPage from "./pages/aboutus/about";
import CheckoutPage from "./features/checkout/pages/CheckoutPage";

import { useAuth } from "./features/auth/state/useAuth";

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

function LoadingScreen() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-10">
            <p>Loading...</p>
        </div>
    );
}

function RequireAuth() {
    const { isAuthenticated, token, user, booting } = useAuth();

    if (booting) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated || !token || !user) {
        return <Navigate to="/auth/login" replace />;
    }

    return <Outlet />;
}

function RequireRole({ allowRoles = [] }) {
    const { isAuthenticated, token, user, booting } = useAuth();
    const normalizedRole = normalizeUserRole(user);

    if (booting) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated || !token || !user) {
        return <Navigate to="/auth/login" replace />;
    }

    if (allowRoles.length > 0 && !allowRoles.includes(normalizedRole)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

function PublicOnlyRoute() {
    const { isAuthenticated, token, user, booting } = useAuth();

    if (booting) {
        return <LoadingScreen />;
    }

    if (isAuthenticated && token && user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

function App() {
    return (
        <BrowserRouter>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />

            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />

                    <Route path="features" element={<FeaturesPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="aboutus" element={<AboutPage />} />

                    <Route path="courses" element={<AllCoursesPage />} />
                    <Route
                        path="courses/:courseId"
                        element={<CourseDetailPage />}
                    />
                    <Route
                        path="courses/:courseId/reviews"
                        element={<CourseReviewsPage />}
                    />
                    <Route path="users/:userId" element={<UserProfilePage />} />

                    <Route
                        path="certificate/:code"
                        element={<PublicCertificatePage />}
                    />
                    <Route
                        path="certificate/public/:code"
                        element={<PublicCertificatePage />}
                    />

                    <Route element={<RequireAuth />}>
                        <Route path="profile" element={<ProfilePage />} />
                        <Route
                            path="profile/edit"
                            element={<EditProfilePage />}
                        />
                        <Route
                            path="profile/change-password"
                            element={<ChangePasswordPage />}
                        />

                        <Route path="cart" element={<CartPage />} />

                        <Route
                            path="courses/:courseId/materials"
                            element={<CourseMaterialsPage />}
                        />
                        <Route
                            path="courses/:courseId/chat"
                            element={<CourseChatPage />}
                        />
                        <Route path="wallet" element={<WalletPage />} />
                        <Route
                            path="transactions"
                            element={<TransactionPage />}
                        />
                    </Route>

                    <Route element={<RequireRole allowRoles={["student"]} />}>
                        <Route path="my-courses" element={<MyCoursesPage />} />
                        <Route
                            path="dashboard/student"
                            element={<StudentDashboardPage />}
                        />

                        <Route
                            path="learn/:courseId"
                            element={<LearnCoursePage />}
                        />
                        <Route
                            path="learn/:courseId/quizzes/:quizId"
                            element={<QuizPage />}
                        />
                        <Route
                            path="learn/:courseId/assignments/:assignmentId"
                            element={<AssignmentPage />}
                        />
                        <Route
                            path="learn/:courseId/chat"
                            element={<CourseChatPage />}
                        />
                        <Route
                            path="learn/:courseId/certificate"
                            element={<CourseCertificatePage />}
                        />
                        <Route
                            path="/checkout/:orderId"
                            element={<CheckoutPage />}
                        />
                        <Route path="deposit" element={<DepositPage />} />
                    </Route>

                    <Route
                        element={
                            <RequireRole allowRoles={["instructor", "admin"]} />
                        }
                    >
                        <Route
                            path="dashboard/instructor"
                            element={<InstructorDashboardPage />}
                        />

                        <Route
                            path="instructor/courses"
                            element={<InstructorCoursesPage />}
                        />
                        <Route
                            path="instructor/courses/create"
                            element={<CreateCoursePage />}
                        />
                        <Route
                            path="instructor/courses/:courseId/edit"
                            element={<EditCoursePage />}
                        />
                        <Route
                            path="instructor/courses/:courseId/lessons"
                            element={<InstructorLessonManagePage />}
                        />
                        <Route
                            path="instructor/courses/:courseId/materials"
                            element={<InstructorMaterialManagePage />}
                        />
                        <Route
                            path="instructor/courses/:courseId/quizzes"
                            element={<InstructorQuizManagePage />}
                        />
                        <Route
                            path="instructor/courses/:courseId/quizzes/create"
                            element={<InstructorQuizCreatePage />}
                        />
                        <Route
                            path="instructor/courses/:courseId/quizzes/:quizId/edit"
                            element={<InstructorQuizEditPage />}
                        />
                        <Route
                            path="instructor/courses/:courseId/quizzes/:quizId/results"
                            element={<InstructorQuizResultsPage />}
                        />
                        <Route
                            path="instructor/courses/:courseId/assignments"
                            element={<InstructorAssignmentManagePage />}
                        />
                        <Route
                            path="instructor/courses/:courseId/assignments/:assignmentId/results"
                            element={<InstructorAssignmentResultsPage />}
                        />
                        <Route
                            path="instructor/courses/:courseId/students"
                            element={<InstructorStudentsPage />}
                        />
                        <Route
                            path="instructor/courses/:courseId/students/:studentId"
                            element={<InstructorStudentDetailPage />}
                        />
                        <Route
                            path="instructor/courses/:courseId/chat"
                            element={<CourseChatPage />}
                        />
                    </Route>

                    <Route element={<RequireRole allowRoles={["admin"]} />}>
                        <Route
                            path="admin/dashboard"
                            element={<AdminDashboardPage />}
                        />
                        <Route
                            path="admin/users"
                            element={<AdminUsersPage />}
                        />
                        <Route
                            path="admin/users/:userId"
                            element={<AdminUserDetailPage />}
                        />
                        <Route
                            path="admin/withdrawals"
                            element={<AdminWithdrawalsPage />}
                        />
                        <Route
                            path="admin/courses"
                            element={<AdminCoursesPage />}
                        />
                        <Route
                            path="admin/courses/:courseId"
                            element={<AdminCourseDetailPage />}
                        />
                        <Route
                            path="admin/deposits"
                            element={<AdminDepositManager />}
                        />
                    </Route>
                </Route>

                <Route element={<PublicOnlyRoute />}>
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />
                    <Route
                        path="/auth/forgot-password"
                        element={<ForgotPasswordPage />}
                    />
                    <Route
                        path="/auth/reset-password"
                        element={<ResetPasswordPage />}
                    />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;