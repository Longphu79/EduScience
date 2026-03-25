export function getLessonId(lesson) {
  if (!lesson) return "";
  if (typeof lesson === "string") return lesson;
  return lesson._id || lesson.id || lesson.lessonId || "";
}

export function normalizeLessonItem(item) {
  if (!item || typeof item !== "object") return null;

  return {
    ...item,
    _id: item._id || item.id || item.lessonId || "",
    title: item.title || "",
    description: item.description || "",
    videoUrl: item.videoUrl || "",
    materialUrl: item.materialUrl || "",
    duration: Number(item.duration || 0),
    order: Number(item.order || 0),
    isPreview: !!item.isPreview,
    isPublished:
      typeof item.isPublished === "boolean" ? item.isPublished : true,
  };
}

export function normalizeLessonResponse(res) {
  const raw = res?.data?.data || res?.data || res || [];
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeLessonItem).filter(Boolean);
}

export function getYoutubeEmbedUrl(url = "") {
  if (!url) return "";

  if (url.includes("youtube.com/embed/")) return url;

  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch?.[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch?.[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&]+)/);
  if (shortsMatch?.[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  return url;
}

export function isYouTubeUrl(url = "") {
  return /youtube\.com|youtu\.be/.test(url);
}

export function formatDuration(minutes) {
  const value = Number(minutes || 0);

  if (!value) return "0 min";
  if (value < 60) return `${value} min`;

  const hours = Math.floor(value / 60);
  const remain = value % 60;

  if (!remain) return `${hours}h`;
  return `${hours}h ${remain}m`;
}

export function sortLessons(lessons = []) {
  if (!Array.isArray(lessons)) return [];

  return [...lessons].sort(
    (a, b) =>
      Number(a?.order || 0) - Number(b?.order || 0) ||
      new Date(a?.createdAt || 0).getTime() -
        new Date(b?.createdAt || 0).getTime()
  );
}

export function getNextLessonOrder(lessons = []) {
  if (!Array.isArray(lessons) || !lessons.length) return 1;

  const maxOrder = Math.max(
    ...lessons.map((item) => Number(item?.order || 0))
  );

  return maxOrder + 1;
}

export function getDefaultLessonForm(nextOrder = 1) {
  return {
    title: "",
    description: "",
    videoUrl: "",
    materialUrl: "",
    duration: 0,
    order: nextOrder,
    isPreview: false,
    isPublished: true,
  };
}