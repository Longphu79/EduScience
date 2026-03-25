import { useContext } from "react";
import { CartContext } from "./CartContext.js"; // Import context từ file Provider

export function useCart() {
    const ctx = useContext(CartContext);

    if (!ctx) {
        throw new Error("useCart must be used inside CartProvider");
    }

    return ctx;
}
