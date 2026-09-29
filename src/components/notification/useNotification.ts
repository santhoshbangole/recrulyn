import { useNotificationContext } from "./NotificationProvider";

export function useNotification() {

  const { show } =
    useNotificationContext();

  return {

    success(
      title: string,
      message?: string
    ) {

      show({
        type: "success",
        title,
        message,
      });

    },

    error(
      title: string,
      message?: string
    ) {

      show({
        type: "error",
        title,
        message,
      });

    },

    warning(
      title: string,
      message?: string
    ) {

      show({
        type: "warning",
        title,
        message,
      });

    },

    info(
      title: string,
      message?: string
    ) {

      show({
        type: "info",
        title,
        message,
      });

    },

  };

}