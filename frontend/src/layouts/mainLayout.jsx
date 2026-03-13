import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { Footer } from "./footer";
import ScrollToTop from "../shared/components/ScrollToTop";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_45%,#ffffff_100%)] text-slate-950">
      <ScrollToTop />
      <Header />
      <main className="relative">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}