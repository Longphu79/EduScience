import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./shared/styles/index.css";
import AuthProvider from "./features/auth/state/authProvider";
import { CartProvider } from "./features/cart/state/CartProvider.jsx";
import { WishlistProvider } from "./features/wishlist/state/wishListProvider.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    <App />
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    </StrictMode>,
);
