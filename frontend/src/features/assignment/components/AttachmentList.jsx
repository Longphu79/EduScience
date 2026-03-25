import { getFileNameFromUrl } from "../utils/assignment.helpers";
import "../styles/assignment-components.css";

export default function AttachmentList({
  items = [],
  emptyText = "",
  removable = false,
  onRemove,
  fallbackPrefix = "Attachment",
}) {
  if (!items.length) {
    return emptyText ? (
      <div className="assignment-attachment-list__empty">{emptyText}</div>
    ) : null;
  }

  return (
    <div className="assignment-attachment-list">
      {items.map((item, index) => {
        const isFileObject = typeof item === "object" && item?.name;
        const key = isFileObject
          ? `${item.name}-${index}`
          : `${String(item)}-${index}`;

        return (
          <div key={key} className="assignment-attachment-list__item">
            {isFileObject ? (
              <div className="assignment-attachment-list__text">{item.name}</div>
            ) : (
              <a
                href={item}
                target="_blank"
                rel="noreferrer"
                className="assignment-attachment-list__link"
              >
                {getFileNameFromUrl(item, `${fallbackPrefix} ${index + 1}`)}
              </a>
            )}

            {removable ? (
              <button
                type="button"
                className="assignment-attachment-list__remove"
                onClick={() => onRemove?.(item, index)}
                title="Remove"
              >
                ×
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}