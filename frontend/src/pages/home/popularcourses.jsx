import { CourseCard } from "../../shared/components/courseCard.jsx";

export function PopularCourses({ courses = [] }) {
    return (
        <section>
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-center mb-12">
                    Popular Courses
                </h2>
                <br />
                <div className="flex gap-6 overflow-x-auto scroll-smooth">
                    {courses.map((course) => (
                        <div key={course._id} className="min-w-[320px]">
                            <CourseCard key={course._id} course={course} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
