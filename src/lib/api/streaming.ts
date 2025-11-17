/**
 * Server-Sent Events (SSE) streaming utilities for real-time message streaming
 */

export interface StreamMessage {
  type: 'message' | 'field_parsed' | 'validation' | 'error' | 'complete' | 'typing';
  data: unknown;
}

export interface StreamMessageData {
  content?: string;
  field_id?: string;
  field_name?: string;
  value?: unknown;
  validated?: boolean;
  validation_error?: string;
  is_complete?: boolean;
  parsed_fields?: unknown[];
}

/**
 * Creates an EventSource connection for SSE streaming
 */
export function createStreamConnection(
  sessionId: string,
  onMessage: (message: StreamMessage) => void,
  onError?: (error: Event) => void,
  onOpen?: () => void
): EventSource {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const url = `${baseUrl}/sessions/${sessionId}/stream`;
  
  const eventSource = new EventSource(url, {
    withCredentials: true,
  });

  eventSource.onopen = () => {
    onOpen?.();
  };

  eventSource.onmessage = (event) => {
    try {
      const message: StreamMessage = JSON.parse(event.data);
      onMessage(message);
    } catch (error) {
      console.error('Failed to parse stream message:', error);
    }
  };

  eventSource.onerror = (error) => {
    onError?.(error);
    // EventSource will automatically reconnect on error
  };

  return eventSource;
}

/**
 * Closes an EventSource connection
 */
export function closeStreamConnection(eventSource: EventSource | null): void {
  if (eventSource) {
    eventSource.close();
  }
}

/**
 * WebSocket connection for bidirectional real-time communication
 * Falls back to SSE if WebSocket is not available
 */
export class SessionStreamConnection {
  private ws: WebSocket | EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isManualClose = false;
  private sessionId: string;
  private onMessage: (message: StreamMessage) => void;
  private onError?: (error: Event | Error) => void;
  private onOpen?: () => void;
  private onClose?: () => void;

  constructor(
    sessionId: string,
    onMessage: (message: StreamMessage) => void,
    onError?: (error: Event | Error) => void,
    onOpen?: () => void,
    onClose?: () => void
  ) {
    this.sessionId = sessionId;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onOpen = onOpen;
    this.onClose = onClose;
  }

  connect(): void {
    this.isManualClose = false;
    this.reconnectAttempts = 0;
    this._connect();
  }

  private _connect(): void {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const wsUrl = baseUrl.replace(/^http/, 'ws');
    
    try {
      // Try WebSocket first
      if (typeof WebSocket !== 'undefined') {
        const ws = new WebSocket(`${wsUrl}/sessions/${this.sessionId}/ws`);
        this.ws = ws;
        
        ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.onOpen?.();
        };

        ws.onmessage = (event) => {
          try {
            const message: StreamMessage = JSON.parse(event.data);
            this.onMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          this.onError?.(error);
        };

        ws.onclose = () => {
          this.onClose?.();
          if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => this._connect(), this.reconnectDelay * this.reconnectAttempts);
          }
        };
      } else {
        // Fallback to SSE
        this.ws = createStreamConnection(
          this.sessionId,
          this.onMessage,
          (error) => this.onError?.(error),
          () => this.onOpen?.()
        );
      }
    } catch (error) {
      console.error('Failed to create stream connection:', error);
      this.onError?.(error as Error);
    }
  }

  send(data: unknown): void {
    const ws = this.ws;
    if (ws instanceof WebSocket && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }

  close(): void {
    this.isManualClose = true;
    const ws = this.ws;
    if (ws instanceof WebSocket) {
      ws.close();
    } else if (ws instanceof EventSource) {
      ws.close();
    }
    this.ws = null;
  }

  isConnected(): boolean {
    const ws = this.ws;
    if (ws instanceof WebSocket) {
      return ws.readyState === WebSocket.OPEN;
    } else if (ws instanceof EventSource) {
      return ws.readyState === EventSource.OPEN;
    }
    return false;
  }
}
