import { useCallback, useEffect, useState } from "react";
import { getMaterialsByCourse } from "../services/material.service";
import MaterialList from "./MaterialList";
import { normalizeMaterialList } from "../utils/material.helpers";

export default function MaterialsTab({ courseId }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMaterialsByCourse(courseId);
      setMaterials(normalizeMaterialList(response));
    } catch {
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      loadMaterials();
    }
  }, [courseId, loadMaterials]);

  if (loading) {
    return <p className="text-slate-600">Đang tải tài liệu...</p>;
  }

  return (
    <MaterialList
      materials={materials}
      emptyTitle="Chưa có tài liệu nào"
      emptyDescription="Khóa học này hiện chưa có tài liệu."
    />
  );
}