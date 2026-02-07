import { Hero } from "./hero.jsx";
import { Features } from "./features.jsx";
import { PopularCourses } from "./popularcourses.jsx";
import { useEffect, useState } from "react";

function Home() {
    const [course, setCourses] = useState([]);

    useEffect(() => {
        fetch("http://localhost:4000/course/popular")
            .then((res) => res.json())
            .then((data) => setCourses(data))
            .catch((err) => console.log(err));
    }, []);

    return (
        <>
            <Hero />
            <Features />
            <PopularCourses courses={course} />
        </>
    );
}

export default Home;
