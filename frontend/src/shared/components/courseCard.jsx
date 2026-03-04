import { RatingStars } from "./ratingStars.jsx";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../features/cart/state/cartContext.jsx";
import { useWishlist } from "../../features/wishlist/state/wishListContext.jsx";

export function CourseCard({ course }) {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToWishlist } = useWishlist();

    const handleEnroll = async () => {
        try {
            await addToCart(course._id);
            navigate("/cart");
        } catch (err) {
            console.error("Add to cart failed:", err);
        }
    };

    const handleWishlist = async () => {
        try {
            await addToWishlist(course._id);
        } catch (err) {
            console.error("Add wishlist failed:", err);
        }
    };

    return (
        <div className="relative bg-gray-100 rounded-lg border border-violet-600 overflow-hidden h-full flex flex-col">
            {/* Thumbnail */}
            <div className="relative w-full aspect-[16/9] overflow-hidden">
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <span className="absolute bottom-3 left-3 bg-blue-950 text-white text-xs px-4 py-1 rounded">
                    {course.category}
                </span>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                    <RatingStars rating={course.rating} />
                    <span className="text-neutral-600 text-sm">
                        ({course.totalReviews})
                    </span>
                </div>

                <span className="text-violet-600 font-medium mb-2">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                </span>

                <h3 className="text-sky-950 font-semibold text-lg leading-snug line-clamp-2 mb-4 min-h-[3.5rem]">
                    {course.title}
                </h3>

                <div className="bg-white rounded-md px-4 py-2 flex justify-between text-sm text-blue-950 mb-4">
                    <span>📘 {course.totalLessons} lessons</span>
                    <span>⏱ {course.duration} h</span>
                    <span>👨‍🎓 {course.totalEnrollments}+</span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img
                            src={course.instructorId?.avatarUrl}
                            alt={course.instructorId?.name}
                            className="w-10 h-10 rounded-full border-2 border-violet-600"
                        />
                        <span className="text-sm font-medium text-blue-950">
                            {course.instructorId?.name}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Wishlist button */}
                        <button
                            onClick={handleWishlist}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 transition shadow"
                        >
                            ♥
                        </button>

                        {/* Enroll button */}
                        <button
                            onClick={handleEnroll}
                            className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 transition"
                        >
                            Enroll
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
