import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import ScrollToTop from "../shared/components/ScrollToTop";
import ChatDockHost from "../features/chat/components/ChatDockHost";
import { ChatDockProvider } from "../features/chat/context/ChatDockContext";

export function MainLayout() {
  return (
    <ChatDockProvider>
      <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_45%,#ffffff_100%)] text-slate-950">
        <ScrollToTop />
        <Header />
        <main className="relative min-h-[60vh]">
          <Outlet />
        </main>
        <Footer />
        <ChatDockHost />
      </div>
    </ChatDockProvider>
  );
}