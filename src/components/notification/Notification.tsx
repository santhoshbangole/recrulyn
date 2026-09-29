import "./notification.css";

import { NotificationItem } from "./NotificationItem";
import { useNotificationContext } from "./NotificationProvider";

export function Notification() {
  const {
    notifications,
    remove,
  } = useNotificationContext();

  return (
    <div className="notification-container">

      {notifications.map(
        (notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={remove}
          />
        )
      )}

    </div>
  );
}