import { useWishlist } from "../../features/wishlist/state/wishListContext";
import { Link } from "react-router-dom";

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

            {wishlistItems.length === 0 ? (
                <div className="bg-white p-10 rounded-xl shadow text-center">
                    <p className="text-gray-500 mb-6 text-lg">
                        Your wishlist is empty.
                    </p>

                    <Link
                        to="/courses"
                        className="inline-block bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition"
                    >
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <>
                    {/* CLEAR BUTTON */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={clearWishlist}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        >
                            Clear Wishlist
                        </button>
                    </div>

                    {/* COURSE LIST */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistItems.map((course) => (
                            <div
                                key={course.id}
                                className="bg-white rounded-xl shadow overflow-hidden border border-gray-200"
                            >
                                {/* Thumbnail */}
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-40 object-cover"
                                />

                                {/* Info */}
                                <div className="p-4 flex flex-col gap-3">
                                    <h2 className="font-semibold text-lg line-clamp-2">
                                        {course.title}
                                    </h2>

                                    <p className="text-violet-600 font-semibold">
                                        {course.price === 0
                                            ? "Free"
                                            : `${course.price.toLocaleString()} VND`}
                                    </p>

                                    {/* ACTIONS */}
                                    <div className="flex justify-between items-center mt-2">
                                        <button
                                            onClick={() =>
                                                removeFromWishlist(course.id)
                                            }
                                            className="text-red-500 hover:text-red-700 text-lg"
                                        >
                                            🗑
                                        </button>

                                        <Link
                                            to={`/course/${course.id}`}
                                            className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 transition"
                                        >
                                            View Course
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Wishlist;
