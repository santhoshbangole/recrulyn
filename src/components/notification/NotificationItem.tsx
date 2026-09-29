import { X } from "lucide-react";

import type { NotificationData } from "./types";

interface Props {
  notification: NotificationData;
  onClose: (id: string) => void;
}

export function NotificationItem({
  notification,
  onClose,
}: Props) {
  return (
    <div
      className={`notification notification-${notification.type}`}
    >
      <div className="notification-header">

        <div className="notification-icon">

          {notification.type === "success" && "✅"}

          {notification.type === "error" && "❌"}

          {notification.type === "warning" && "⚠️"}

          {notification.type === "info" && "ℹ️"}

        </div>

        <div className="notification-body">

          <div className="notification-title">
            {notification.title}
          </div>

          {notification.message && (
            <div className="notification-message">
              {notification.message}
            </div>
          )}

          {notification.action && (
            <button
              className="notification-action"
              onClick={
                notification.action.onClick
              }
            >
              {notification.action.label}
            </button>
          )}

        </div>

        {notification.closable && (
          <button
            className="notification-close"
            onClick={() =>
              onClose(notification.id)
            }
          >
            <X size={18} />
          </button>
        )}

      </div>

      <div
        className="notification-progress"
        style={{
          animationDuration: `${
            notification.duration ?? 4000
          }ms`,
        }}
      />

    </div>
  );
}