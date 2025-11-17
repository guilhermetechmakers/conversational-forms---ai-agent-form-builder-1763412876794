import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SessionStreamConnection } from "@/lib/api/streaming";
import type { StreamMessage } from "@/lib/api/streaming";
import type { SessionMessage, ParsedField, Session } from "@/types/session";
import { toast } from "sonner";

interface UseSessionOrchestrationOptions {
  sessionId: string | null;
  enabled?: boolean;
  onComplete?: (session: Session) => void;
  onError?: (error: Error) => void;
}

interface StreamingState {
  isStreaming: boolean;
  currentMessage: string;
  isTyping: boolean;
}

/**
 * Enhanced session orchestration hook with real-time streaming support
 */
export function useSessionOrchestration(options: UseSessionOrchestrationOptions) {
  const { sessionId, enabled = true, onComplete, onError } = options;
  const queryClient = useQueryClient();
  const streamConnectionRef = useRef<SessionStreamConnection | null>(null);
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    currentMessage: '',
    isTyping: false,
  });

  // Handle stream messages
  const handleStreamMessage = useCallback((message: StreamMessage) => {
    if (!sessionId) return;

    switch (message.type) {
      case 'message':
        {
          const data = message.data as { content: string; role: 'assistant' | 'user' };
          setStreamingState((prev) => ({
            ...prev,
            currentMessage: data.content,
            isStreaming: true,
          }));

          // Update session transcript
          queryClient.setQueryData<Session>(["session", sessionId], (old) => {
            if (!old) return old;
            
            const newMessage: SessionMessage = {
              id: `msg-${Date.now()}`,
              role: data.role,
              content: data.content,
              timestamp: new Date().toISOString(),
            };

            return {
              ...old,
              transcript: [...old.transcript, newMessage],
            };
          });
        }
        break;

      case 'field_parsed':
        {
          const data = message.data as {
            field_id: string;
            field_name: string;
            value: string | string[] | boolean | number;
            validated: boolean;
          };
          
          queryClient.setQueryData<Session>(["session", sessionId], (old) => {
            if (!old) return old;
            
            const existingIndex = old.parsed_fields.findIndex(
              (f) => f.field_id === data.field_id
            );

            const newField: ParsedField = {
              field_id: data.field_id,
              field_name: data.field_name,
              value: data.value,
              validated: data.validated,
            };

            const parsedFields =
              existingIndex >= 0
                ? old.parsed_fields.map((f, i) =>
                    i === existingIndex ? newField : f
                  )
                : [...old.parsed_fields, newField];

            return {
              ...old,
              parsed_fields: parsedFields,
            };
          });
        }
        break;

      case 'validation':
        {
          const data = message.data as {
            field_id: string;
            validated: boolean;
            validation_error?: string;
          };
          
          queryClient.setQueryData<Session>(["session", sessionId], (old) => {
            if (!old) return old;
            
            return {
              ...old,
              parsed_fields: old.parsed_fields.map((f) =>
                f.field_id === data.field_id
                  ? {
                      ...f,
                      validated: data.validated,
                      validation_error: data.validation_error,
                    }
                  : f
              ),
            };
          });
        }
        break;

      case 'typing':
        {
          const data = message.data as { is_typing: boolean };
          setStreamingState((prev) => ({
            ...prev,
            isTyping: data.is_typing,
          }));
        }
        break;

      case 'complete':
        {
          const data = message.data as { session: Session };
          setStreamingState({
            isStreaming: false,
            currentMessage: '',
            isTyping: false,
          });
          
          queryClient.setQueryData<Session>(["session", sessionId], data.session);
          onComplete?.(data.session);
        }
        break;

      case 'error':
        {
          const data = message.data as { message: string; error?: string };
          const errorMessage = data.message || data.error || 'An error occurred';
          setStreamingState({
            isStreaming: false,
            currentMessage: '',
            isTyping: false,
          });
          
          toast.error(errorMessage);
          onError?.(new Error(errorMessage));
        }
        break;
    }
  }, [sessionId, queryClient, onComplete, onError]);

  // Connect to stream
  useEffect(() => {
    if (!enabled || !sessionId) {
      return;
    }

    const connection = new SessionStreamConnection(
      sessionId,
      handleStreamMessage,
      (error) => {
        console.error('Stream connection error:', error);
        toast.error('Connection error. Please try again.');
        onError?.(error instanceof Error ? error : new Error('Stream connection failed'));
      },
      () => {
        console.log('Stream connection opened');
      },
      () => {
        console.log('Stream connection closed');
        setStreamingState({
          isStreaming: false,
          currentMessage: '',
          isTyping: false,
        });
      }
    );

    connection.connect();
    streamConnectionRef.current = connection;

    return () => {
      connection.close();
      streamConnectionRef.current = null;
    };
  }, [sessionId, enabled, handleStreamMessage, onError]);

  // Send message through stream (if WebSocket)
  const sendStreamMessage = useCallback((content: string) => {
    if (streamConnectionRef.current?.isConnected()) {
      streamConnectionRef.current.send({ type: 'message', content });
    }
  }, []);

  return {
    streamingState,
    sendStreamMessage,
    isConnected: streamConnectionRef.current?.isConnected() ?? false,
  };
}
