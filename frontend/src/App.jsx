import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./layouts/mainLayout.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Home from "./pages/home/home.jsx";
import About from "./pages/aboutus/about.jsx";
import { Features } from "./pages/home/features.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Layout route */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/aboutus" element={<About />} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
