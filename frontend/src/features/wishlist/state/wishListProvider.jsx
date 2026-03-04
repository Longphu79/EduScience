import { useEffect, useState } from "react";
import { WishlistContext } from "./wishListContext.jsx";

import {
    getWishlistApi,
    addWishlistApi,
    removeFromWishlistApi,
    clearWishlistApi,
} from "../api/wishListApi.js";

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);

    // load wishlist từ server
    const loadWishlist = async () => {
        try {
            const data = await getWishlistApi();

            if (!data || !data.courseIds) {
                setWishlistItems([]);
                return;
            }

            const formatted = data.courseIds.map((course) => ({
                id: course._id,
                title: course.title,
                price: course.price,
                thumbnail: course.thumbnail,
            }));

            setWishlistItems(formatted);
        } catch (err) {
            console.error("Load wishlist error:", err);
        }
    };

    // load khi app start
    useEffect(() => {
        const initWishlist = async () => {
            await loadWishlist();
        };

        initWishlist();
    }, []);

    // thêm course
    const addToWishlist = async (courseId) => {
        try {
            await addWishlistApi(courseId);
            await loadWishlist();
        } catch (err) {
            console.error("Add wishlist error:", err);
        }
    };

    // xoá course
    const removeFromWishlist = async (courseId) => {
        try {
            await removeFromWishlistApi(courseId);
            await loadWishlist();
        } catch (err) {
            console.error("Remove wishlist error:", err);
        }
    };

    // clear wishlist
    const clearWishlist = async () => {
        try {
            await clearWishlistApi();
            setWishlistItems([]);
        } catch (err) {
            console.error("Clear wishlist error:", err);
        }
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                clearWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};
