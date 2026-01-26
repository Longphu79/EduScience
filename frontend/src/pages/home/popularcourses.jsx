import { CourseCard } from "../../shared/components/courseCard.jsx";

export function PopularCourses({ courses = [] }) {
    return (
        <section>
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-center mb-12">
                    Popular Courses
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            </div>
        </section>
    );
}
