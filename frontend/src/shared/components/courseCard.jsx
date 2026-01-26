import { RatingStars } from "./ratingStars.jsx";

export function CourseCard({ course}) {
    return (
        <div className="bg-gray-100 rounded-lg border border-violet-600 overflow">
            {/* Thumbnail */}
            <div className="relative">
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-60 object-cover"
                />
            </div>

            <span className="absolute bottom-3 left-3 bg-blue-950 text-white text-xs px-4 py-1 rounded">
                {course.category}
            </span>

            {/* Course Info */}
            <div className="p-4 flex flex-col flex-2">
                {/* Title + price*/}
                <div className="flex items-center justify-between mb-3">
                    <RatingStars rating={course.rating} />
                    <span className="text-neutral-600 text-sm">
                        ({course.totalReviews})
                    </span>
                </div>
                <span className="text-violet-600 font-medium">
                    {course.price === 0 ? "Free" : `$${course.price}`}
                </span>
            </div>

            {/* title */}
            <h3 className="text-sky-950 font-semibold text-lg leading-snug line-clamp-2 mb-4">
                {course.title}
            </h3>

            {/* Meta Info */}
            <div className="bg-white rounded-md px-4 py-2 flex justify-between text-sm text-blue-950 mb-4">
                <span>📘{course.totalLessons} lessons</span>
                <span>⏱{course.duration} h</span>
                <span>👨‍🎓{course.totalEnrollments}+</span>
            </div>

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img
                        src={course.Instructor.avatarUrl}
                        className="w-11 h-11 rounded-full border-2 border-violet-600"
                    />
                    <span className="text-sm font-medium text-blue-950">
                        {course.Instructor.name}
                    </span>
                </div>
                <button className="bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700 transition">
                    Enroll
                </button>
            </div>
        </div>
    );
}
