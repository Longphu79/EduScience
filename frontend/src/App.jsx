import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/mainLayout.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Home from "./pages/home/home.jsx";
import About from "./pages/aboutus/about.jsx";
import { Features } from "./pages/home/features.jsx";
import Cart from "./pages/cart/cart.jsx";
import AllCoursesPage from "./pages/course/AllCoursesPage.jsx";
import CourseDetailPage from "./pages/course/CourseDetailPage.jsx";
import MyCoursesPage from "./pages/course/MyCoursesPage.jsx";
import InstructorCoursesPage from "./pages/course/InstructorCoursesPage.jsx";
import LearnCoursePage from "./pages/course/LearnCoursePage.jsx";
import ScrollToTop from "./shared/components/ScrollToTop.jsx";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/aboutus" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/courses" element={<AllCoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/instructor-courses" element={<InstructorCoursesPage />} />
          <Route path="/learn/:courseId" element={<LearnCoursePage />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;