import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';

interface WSMessage {
  type: 'subscribe' | 'unsubscribe' | 'data-update';
  channel?: string;
  data?: any;
}

const channels: Map<string, Set<WebSocket>> = new Map();

export function setupWebSocket(server: Server): void {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    const clientChannels = new Set<string>();

    ws.on('message', (rawMessage: Buffer | string) => {
      try {
        const message: WSMessage = JSON.parse(
          typeof rawMessage === 'string' ? rawMessage : rawMessage.toString()
        );

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
