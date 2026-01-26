import { Outlet } from "react-router-dom";
import { Header } from "./header";
import { Footer } from "./footer";

export function MainLayout() {
  return (
    <>
      <Header />
      
      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}
