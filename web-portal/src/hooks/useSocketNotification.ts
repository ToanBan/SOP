import { useEffect, useRef } from "react";
import { getSocket } from "./initSocket";

export function useSocketNotification(
  onNewNotification: (notification: any) => void,
) {
  const callbackRef = useRef(onNewNotification);
  callbackRef.current = onNewNotification;

  useEffect(() => {
    const socket = getSocket();

    const handleNotification = (notification: any) => {
      console.log("[Socket] NOTIFICATION RECEIVED:", notification);
      callbackRef.current(notification);
    };

    socket.on("new_notification", handleNotification);

    return () => {
      socket.off("new_notification", handleNotification);
    };
  }, []);
}