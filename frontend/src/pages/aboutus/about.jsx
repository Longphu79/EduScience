import { Goals } from "./goals.jsx";

function About() {
    return (
        <section className="py-20">
            <div className="mx-auto max-w-5xl px-6 lg:px-8">
                \<h1 className="text-4xl font-semibold mb-6">About Us</h1>
                <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                    EDU Science is an online learning platform built to help
                    students and professionals develop real-world skills through
                    practical, high-quality courses. We focus on bridging the
                    gap between traditional education and industry demands by
                    providing learning experiences that are engaging,
                    accessible, and outcome-driven.
                </p>
                <br />
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                    Our mission is to make high-quality education accessible to
                    everyone, regardless of background or location. We believe
                    learning should not only be theoretical but also practical,
                    helping learners apply knowledge directly to real-world
                    challenges.
                </p>
                <p className="text-gray-600 leading-relaxed">
                    By combining modern teaching methods, technology, and
                    industry-relevant content, we aim to empower learners to
                    grow confidently in an ever-changing digital world.
                </p>
                <br />
                <h2 className="text-2xl font-semibold mb-8">Our Goals</h2>
                <Goals />
            </div>
        </section>
    );
}

export default About;
