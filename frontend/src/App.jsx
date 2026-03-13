import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/mainLayout.jsx";
import ScrollToTop from "./shared/components/ScrollToTop.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Home from "./pages/home/home.jsx";

import AllCoursesPage from "./features/course/pages/AllCoursesPage.jsx";
import CourseDetailPage from "./features/course/pages/CourseDetailPage.jsx";
import CreateCoursePage from "./features/course/pages/CreateCoursePage.jsx";
import EditCoursePage from "./features/course/pages/EditCoursePage.jsx";
import InstructorCoursesPage from "./features/course/pages/InstructorCoursesPage.jsx";

import LearnCoursePage from "./features/enrollment/pages/LearnCoursePage.jsx";
import MyCoursesPage from "./features/enrollment/pages/MyCoursesPage.jsx";
import InstructorStudentsPage from "./features/enrollment/pages/InstructorStudentsPage.jsx";
import InstructorStudentDetailPage from "./features/enrollment/pages/InstructorStudentDetailPage.jsx";

import CourseMaterialsPage from "./features/material/pages/CourseMaterialsPage.jsx";
import InstructorMaterialManagePage from "./features/material/pages/InstructorMaterialManagePage.jsx";
import InstructorLessonManagePage from "./features/lesson/pages/InstructorLessonManagePage.jsx";

import QuizPage from "./features/quiz/pages/QuizPage.jsx";
import InstructorQuizManagePage from "./features/quiz/pages/InstructorQuizManagePage.jsx";
import InstructorQuizCreatePage from "./features/quiz/pages/InstructorQuizCreatePage.jsx";
import InstructorQuizEditPage from "./features/quiz/pages/InstructorQuizEditPage.jsx";
import InstructorQuizResultsPage from "./features/quiz/pages/InstructorQuizResultsPage.jsx";

import AssignmentPage from "./features/assignment/pages/AssignmentPage.jsx";
import InstructorAssignmentManagePage from "./features/assignment/pages/InstructorAssignmentManagePage.jsx";
import InstructorAssignmentResultsPage from "./features/assignment/pages/InstructorAssignmentResultsPage.jsx";

import CourseChatPage from "./features/chat/pages/CourseChatPage.jsx";
import { useAuth } from "./features/auth/state/useAuth.jsx";

import FeaturesPage from "./pages/features/Features.jsx";
import AboutPage from "./pages/aboutus/about.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated, booting } = useAuth();

  if (booting) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}

function InstructorRoute({ children }) {
  const { isAuthenticated, user, booting } = useAuth();

  if (booting) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user?.role !== "instructor") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, booting } = useAuth();

  if (booting) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />

          <Route path="features" element={<FeaturesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="aboutus" element={<AboutPage />} />

          <Route path="courses" element={<AllCoursesPage />} />
          <Route path="courses/:courseId" element={<CourseDetailPage />} />

          <Route
            path="my-courses"
            element={
              <ProtectedRoute>
                <MyCoursesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="learn/:courseId"
            element={
              <ProtectedRoute>
                <LearnCoursePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="courses/:courseId/materials"
            element={
              <ProtectedRoute>
                <CourseMaterialsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="courses/:courseId/chat"
            element={
              <ProtectedRoute>
                <CourseChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="instructor/courses"
            element={
              <InstructorRoute>
                <InstructorCoursesPage />
              </InstructorRoute>
            }
          />

          <Route
            path="instructor/courses/create"
            element={
              <InstructorRoute>
                <CreateCoursePage />
              </InstructorRoute>
            }
          />

          <Route
            path="instructor/courses/:courseId/edit"
            element={
              <InstructorRoute>
                <EditCoursePage />
              </InstructorRoute>
            }
          />

          <Route
            path="instructor/courses/:courseId/lessons"
            element={
              <InstructorRoute>
                <InstructorLessonManagePage />
              </InstructorRoute>
            }
          />

          <Route
            path="instructor/courses/:courseId/materials"
            element={
              <InstructorRoute>
                <InstructorMaterialManagePage />
              </InstructorRoute>
            }
          />

          <Route
            path="instructor/courses/:courseId/quizzes"
            element={
              <InstructorRoute>
                <InstructorQuizManagePage />
              </InstructorRoute>
            }
          />

          <Route
            path="instructor/courses/:courseId/quizzes/create"
            element={
              <InstructorRoute>
                <InstructorQuizCreatePage />
              </InstructorRoute>
            }
          />

          <Route
            path="instructor/courses/:courseId/quizzes/:quizId/edit"
            element={
              <InstructorRoute>
                <InstructorQuizEditPage />
              </InstructorRoute>
            }
          />

          <Route
            path="instructor/courses/:courseId/quizzes/:quizId/results"
            element={
              <InstructorRoute>
                <InstructorQuizResultsPage />
              </InstructorRoute>
            }
          />

          <Route
            path="instructor/courses/:courseId/assignments"
            element={
              <InstructorRoute>
                <InstructorAssignmentManagePage />
              </InstructorRoute>
            }
          />

          <Route
            path="instructor/courses/:courseId/assignments/:assignmentId/results"
            element={
              <InstructorRoute>
                <InstructorAssignmentResultsPage />
              </InstructorRoute>
            }
          />

          <Route
            path="instructor/courses/:courseId/students"
            element={
              <InstructorRoute>
                <InstructorStudentsPage />
              </InstructorRoute>
            }
          />

          <Route
            path="instructor/courses/:courseId/students/:studentId"
            element={
              <InstructorRoute>
                <InstructorStudentDetailPage />
              </InstructorRoute>
            }
          />
        </Route>

        <Route
          path="/auth/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/auth/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/learn/:courseId/quizzes/:quizId"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/learn/:courseId/assignments/:assignmentId"
          element={
            <ProtectedRoute>
              <AssignmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/learn/:courseId/chat"
          element={
            <ProtectedRoute>
              <CourseChatPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;