import { useEffect, useRef, useState } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';

interface WebSocketMessage {
  type: string;
  topicId: string;
  groupId: string;
  payload: any;
  senderId: string;
  senderName: string;
  timestamp: string;
}

interface UseWebSocketOptions {
  topicId?: string;
  groupId?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket({
  topicId,
  groupId,
  onMessage,
  onConnect,
  onDisconnect,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!topicId && !groupId) return;

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws-forum',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        onConnect?.();

        if (topicId) {
          client.subscribe(`/topic/topic/${topicId}`, (message: IMessage) => {
            try {
              const body: WebSocketMessage = JSON.parse(message.body);
              console.log('Received topic WebSocket message:', body);
              onMessageRef.current?.(body);
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error);
            }
          });
        }

        if (groupId) {
          client.subscribe(`/topic/forum/${groupId}`, (message: IMessage) => {
            try {
              const body: WebSocketMessage = JSON.parse(message.body);
              console.log('Received group WebSocket message:', body);
              onMessageRef.current?.(body);
            } catch (error) {
              console.error('Failed to parse group WebSocket message:', error);
            }
          });
        }
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message'], frame.body);
        setIsConnected(false);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.log('Deactivating WebSocket');
      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [topicId, groupId]);

  return {
    isConnected,
  };
}
