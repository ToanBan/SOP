import { io, Socket } from "socket.io-client";
import { getAccessToken } from "../context/tokenStore";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

declare global {
  interface Window {
    __socket: Socket | null;
  }
}

export function initSocket() {
  if (window.__socket) return window.__socket;

  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: (cb) => cb({ token: getAccessToken() }),
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  window.__socket = socket;
  return socket;
}