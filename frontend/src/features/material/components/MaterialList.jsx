import React from "react";
import MaterialEmptyState from "./MaterialEmptyState";
import MaterialListItem from "./MaterialListItem";
import { getMaterialId } from "../utils/material.helpers";

export default function MaterialList({
  materials = [],
  getLessonTitle,
  showActions = false,
  onEdit,
  onDelete,
  deletingId = "",
  emptyTitle = "Không có tài liệu.",
  emptyDescription = "Hiện chưa có tài liệu để hiển thị.",
}) {
  if (!materials.length) {
    return (
      <MaterialEmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {materials.map((item, index) => {
        const materialId = getMaterialId(item);

        return (
          <MaterialListItem
            key={materialId || index}
            item={item}
            index={index}
            lessonTitle={getLessonTitle ? getLessonTitle(item?.lessonId) : null}
            showActions={showActions}
            onEdit={onEdit}
            onDelete={onDelete}
            deleting={deletingId === materialId}
          />
        );
      })}
    </div>
  );
}