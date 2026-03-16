import ChatDockItem from "./ChatDockItem";

export default function ChatDockArea({
  boxes = [],
  currentUserId = null,
  onCloseBox,
  onToggleMinimize,
  onFocusBox,
}) {
  if (!Array.isArray(boxes) || boxes.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 right-4 z-[85] flex max-w-[calc(100vw-24px)] items-end gap-3">
      {boxes.map((conversation) => (
        <div key={conversation._id} className="pointer-events-auto">
          <ChatDockItem
            conversation={conversation}
            currentUserId={currentUserId}
            onClose={() => onCloseBox?.(conversation._id)}
            onToggleMinimize={() => onToggleMinimize?.(conversation._id)}
            onFocus={() => onFocusBox?.(conversation._id)}
          />
        </div>
      ))}
    </div>
  );
}