import { useEffect, useState } from "react";
import { getMaterialsByCourse } from "../services/material.service";

export default function MaterialsTab({ courseId }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const response = await getMaterialsByCourse(courseId);
        const data = response?.data?.data || response?.data || response || [];
        setMaterials(Array.isArray(data) ? data : []);
      } catch {
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchMaterials();
  }, [courseId]);

  if (loading) return <p>Đang tải tài liệu...</p>;

  if (!materials.length) {
    return <p className="text-slate-600">Chưa có tài liệu nào.</p>;
  }

  return (
    <div className="space-y-3">
      {materials.map((item) => (
        <a
          key={item._id}
          href={item.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
        >
          <p className="font-medium text-slate-900">{item.title}</p>
          <p className="text-sm text-slate-600">{item.description}</p>
        </a>
      ))}
    </div>
  );
}