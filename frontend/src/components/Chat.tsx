import React, { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { signalRService } from '../services/signalR';
import type { ChatMessageDto } from '../types/chat';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await signalRService.startConnection();
        setIsConnected(true);
        setConnectionError(null);

        // Listen for messages
        signalRService.onReceiveMessage((newMessage: ChatMessageDto) => {
          setMessages((prev) => [...prev, newMessage]);
        });

        // Listen for connection state changes
        signalRService.onConnectionStateChange((state) => {
          setIsConnected(state === signalR.HubConnectionState.Connected);
        });
        
        // Set initial connection state
        setIsConnected(signalRService.getConnectionState() === signalR.HubConnectionState.Connected);
      } catch (error: any) {
        console.error('Failed to connect to SignalR:', error);
        setConnectionError(error.message || 'Failed to connect to chat');
        setIsConnected(false);
      }
    };

    initializeConnection();

    return () => {
      signalRService.offReceiveMessage(() => {});
      signalRService.stopConnection();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !isConnected) {
      return;
    }

    try {
      await signalRService.sendMessage(message.trim());
      setMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      setConnectionError(error.message || 'Failed to send message');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('sq-AL', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const isMyMessage = (messageUserId: string | null) => {
    // Compare with current user - you might need to adjust this based on your user structure
    return messageUserId === user?.email || messageUserId === localStorage.getItem('userId');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat</h2>
        <div className="chat-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '●' : '○'}
          </span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {connectionError && (
        <div className="chat-error">
          {connectionError}
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>No messages. Be the first to write!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${isMyMessage(msg.userId) ? 'my-message' : 'other-message'}`}
            >
              <div className="message-header">
                <span className="message-user">{msg.userName || 'Anonymous'}</span>
                <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isConnected ? 'Write a message...' : 'Connecting...'}
          disabled={!isConnected}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={!isConnected || !message.trim()}
          className="chat-send-button"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
