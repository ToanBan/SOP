import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "../context/tokenStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4999";

let socket: Socket | null = null;

function initSocket() {
  if (socket) return socket;

  const token = getAccessToken();
  console.log(token);

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    auth: (cb) => {
      cb({ token: getAccessToken() });
    },
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket error:", err);
  });

  return socket;
}

export function useSocket(
  conversationId: string | null,
  onNewMessage: (message: any) => void,
) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    if (!conversationId) return;

    const socket = initSocket();
    if (!socket) return;

    const handleMessage = (message: any) => {
      console.log("[Socket] RECEIVED:", message);
      callbackRef.current(message);
    };

    const joinRoom = () => {
      socket.emit("join_conversation", conversationId);
      console.log("[Socket] Joined:", conversationId);
    };

    socket.on("new_message", handleMessage);

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once("connect", joinRoom);
    }

    return () => {
      socket.emit("leave_conversation", conversationId);
      socket.off("new_message", handleMessage);
      socket.off("connect", joinRoom);
    };
  }, [conversationId]);
}
