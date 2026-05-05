import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:3004';

let socket: Socket | null = null;

function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
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

    const socket = getSocket();
    const event = `conversation:${conversationId}`;

    const handler = (message: any) => {
      callbackRef.current(message);
    };

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [conversationId]);
}