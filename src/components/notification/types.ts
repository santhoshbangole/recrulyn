export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info";

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface NotificationData {
  id: string;

  type: NotificationType;

  title: string;

  message?: string;

  duration?: number;

  action?: NotificationAction;

  closable?: boolean;
}