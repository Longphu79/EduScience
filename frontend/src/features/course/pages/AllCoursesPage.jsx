import Toast from "../../../shared/components/Toast";
import AllCoursesHero from "../components/AllCoursesHero";
import AllCoursesHighlight from "../components/AllCoursesHighlight";
import AllCoursesFilters from "../components/AllCoursesFilters";
import AllCoursesResults from "../components/AllCoursesResults";
import useAllCoursesPage from "../hooks/useAllCoursesPage";
import "../styles/all-courses-page.css";

export default function AllCoursesPage() {
    const {
        heroRef,
        courses,
        loading,
        pagination,
        keywordInput,
        activeCategory,
        activeLevel,
        activePricing,
        activeRating,
        sortBy,
        toast,
        totalCourses,
        totalStudents,
        avgRating,
        featuredCourses,
        setToast,
        setKeywordInput,
        setActiveCategory,
        setActiveLevel,
        setActivePricing,
        setActiveRating,
        setSortBy,
        setPage,
        handleHeroMove,
        handleResetFilters,
    } = useAllCoursesPage();

    return (
        <div className="all-courses-page">
            <Toast
                kind={toast.kind}
                message={toast.message}
                position="bottom-center"
                onClose={() => setToast({ message: "", kind: "success" })}
            />

            <div className="all-courses-page__orb all-courses-page__orb--1" />
            <div className="all-courses-page__orb all-courses-page__orb--2" />
            <div className="all-courses-page__orb all-courses-page__orb--3" />
            <div className="all-courses-page__grid-pattern" />

            <AllCoursesHero
                heroRef={heroRef}
                totalCourses={totalCourses}
                totalStudents={totalStudents}
                avgRating={avgRating}
                onHeroMove={handleHeroMove}
                onStartLearning={() =>
                    setToast({
                        message: "Start exploring our premium courses!",
                        kind: "success",
                    })
                }
            />

            <AllCoursesHighlight featuredCourses={featuredCourses} />

            <AllCoursesFilters
                keywordInput={keywordInput}
                activeCategory={activeCategory}
                activeLevel={activeLevel}
                activePricing={activePricing}
                activeRating={activeRating}
                sortBy={sortBy}
                onChangeKeyword={setKeywordInput}
                onChangeCategory={(value) => {
                    setActiveCategory(value);
                    setPage(1);
                }}
                onChangeLevel={(value) => {
                    setActiveLevel(value);
                    setPage(1);
                }}
                onChangePricing={(value) => {
                    setActivePricing(value);
                    setPage(1);
                }}
                onChangeRating={(value) => {
                    setActiveRating(value);
                    setPage(1);
                }}
                onChangeSortBy={setSortBy}
                onResetFilters={handleResetFilters}
            />

            <AllCoursesResults
                loading={loading}
                courses={courses}
                pagination={pagination}
                onChangePage={setPage}
            />
        </div>
    );
}
