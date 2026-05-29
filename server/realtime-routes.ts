import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';

interface WSMessage {
  type: 'subscribe' | 'unsubscribe' | 'data-update';
  channel?: string;
  data?: any;
}

const channels: Map<string, Set<WebSocket>> = new Map();

const MAX_MESSAGE_SIZE = 65536; // 64KB
const CHANNEL_NAME_PATTERN = /^[a-zA-Z0-9-]+$/;
const MAX_CHANNEL_NAME_LENGTH = 128;

function isValidChannelName(channel: string): boolean {
  return (
    channel.length > 0 &&
    channel.length <= MAX_CHANNEL_NAME_LENGTH &&
    CHANNEL_NAME_PATTERN.test(channel)
  );
}

export function setupWebSocket(server: Server): void {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    const clientChannels = new Set<string>();

    ws.on('message', (rawMessage: Buffer | string) => {
      const messageStr = typeof rawMessage === 'string' ? rawMessage : rawMessage.toString();

      if (messageStr.length > MAX_MESSAGE_SIZE) {
        ws.send(JSON.stringify({ type: 'error', message: 'Message exceeds maximum size of 64KB' }));
        return;
      }

      try {
        const message: WSMessage = JSON.parse(messageStr);

        if (message.channel && !isValidChannelName(message.channel)) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid channel name. Use alphanumeric characters and dashes only (max 128 chars).' }));
          return;
        }

        switch (message.type) {
          case 'subscribe': {
            if (!message.channel) break;
            clientChannels.add(message.channel);
            if (!channels.has(message.channel)) {
              channels.set(message.channel, new Set());
            }
            channels.get(message.channel)!.add(ws);
            ws.send(JSON.stringify({ type: 'subscribed', channel: message.channel }));
            break;
          }

          case 'unsubscribe': {
            if (!message.channel) break;
            clientChannels.delete(message.channel);
            const channelSubs = channels.get(message.channel);
            if (channelSubs) {
              channelSubs.delete(ws);
              if (channelSubs.size === 0) {
                channels.delete(message.channel);
              }
            }
            ws.send(JSON.stringify({ type: 'unsubscribed', channel: message.channel }));
            break;
          }

          case 'data-update': {
            if (!message.channel) break;
            const subscribers = channels.get(message.channel);
            if (subscribers) {
              const payload = JSON.stringify({
                type: 'data-update',
                channel: message.channel,
                data: message.data,
              });
              subscribers.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(payload);
                }
              });
            }
            break;
          }
        }
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      clientChannels.forEach((channel) => {
        const channelSubs = channels.get(channel);
        if (channelSubs) {
          channelSubs.delete(ws);
          if (channelSubs.size === 0) {
            channels.delete(channel);
          }
        }
      });
    });
  });
}
