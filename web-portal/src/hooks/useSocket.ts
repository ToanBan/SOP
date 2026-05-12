import { useEffect, useRef } from "react";
import { getSocket } from "./initSocket";

export function useSocket(
  conversationId: string | null,
  onNewMessage: (message: any) => void,
) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    getSocket(); 
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const socket = getSocket();

    const handleMessage = (message: any) => {
      if (message.conversationId !== conversationId) return;
      console.log("[Socket] RECEIVED:", message);
      callbackRef.current(message);
    };

    socket.on("new_message", handleMessage);

    return () => {
      socket.off("new_message", handleMessage);
    };
  }, [conversationId]);
}