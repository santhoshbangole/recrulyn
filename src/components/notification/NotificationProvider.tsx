import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import type { NotificationData } from "./types";
interface NotificationContextType {
  notifications: NotificationData[];

  show: (
    notification: Omit<
      NotificationData,
      "id"
    >
  ) => string;

  remove: (
    id: string
  ) => void;

  clear: () => void;
}

const NotificationContext =
  createContext<
    NotificationContextType | null
  >(null);

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [
    notifications,
    setNotifications,
  ] = useState<
    NotificationData[]
  >([]);

  function remove(
    id: string
  ) {

    setNotifications(
      prev =>
        prev.filter(
          n => n.id !== id
        )
    );

  }

  function clear() {

    setNotifications([]);

  }

  function show(
    notification: Omit<
      NotificationData,
      "id"
    >
  ) {

    const id =
      crypto.randomUUID();

    const item: NotificationData = {

      id,

      duration: 4000,

      closable: true,

      ...notification,

    };

    setNotifications(
      prev => [
        ...prev,
        item,
      ]
    );

    if (
      item.duration &&
      item.duration > 0
    ) {

      window.setTimeout(
        () => remove(id),
        item.duration
      );

    }

    return id;

  }

  const value =
    useMemo(
      () => ({
        notifications,
        show,
        remove,
        clear,
      }),
      [notifications]
    );

  return (

    <NotificationContext.Provider
      value={value}
    >

      {children}

    </NotificationContext.Provider>

  );

}

export function useNotificationContext() {

  const context =
    useContext(
      NotificationContext
    );

  if (!context) {

    throw new Error(
      "NotificationProvider is missing."
    );

  }

  return context;

}