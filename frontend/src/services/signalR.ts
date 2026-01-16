import * as signalR from '@microsoft/signalr';
import type { OrderResponseDto } from '../types/order';

const CHAT_HUB_URL = 'http://localhost:5067/chathub';
const ORDER_HUB_URL = 'http://localhost:5067/orderhub';

class SignalRService {
  private chatConnection: signalR.HubConnection | null = null;
  private orderConnection: signalR.HubConnection | null = null;

  // Chat connection methods
  async startChatConnection(): Promise<void> {
    if (this.chatConnection && this.chatConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.chatConnection) {
      await this.stopChatConnection();
    }

    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No access token found. Please login first.');
    }

    console.log('Starting SignalR chat connection to:', CHAT_HUB_URL);
    
    this.chatConnection = new signalR.HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, {
        accessTokenFactory: () => {
          const currentToken = localStorage.getItem('accessToken');
          return currentToken || '';
        },
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.chatConnection.onclose((error) => {
      console.log('SignalR chat connection closed', error);
    });

    this.chatConnection.onreconnecting((error) => {
      console.log('SignalR chat reconnecting', error);
    });

    this.chatConnection.onreconnected((connectionId) => {
      console.log('SignalR chat reconnected', connectionId);
    });

    try {
      await this.chatConnection.start();
      console.log('SignalR Chat Connected successfully. Connection ID:', this.chatConnection.connectionId);
    } catch (error: any) {
      console.error('Error starting SignalR chat connection:', error);
      throw error;
    }
  }

  async stopChatConnection(): Promise<void> {
    if (this.chatConnection) {
      await this.chatConnection.stop();
      this.chatConnection = null;
      console.log('SignalR Chat Disconnected');
    }
  }

  // Order connection methods
  async startOrderConnection(): Promise<void> {
    if (this.orderConnection && this.orderConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.orderConnection) {
      await this.stopOrderConnection();
    }

    // Order hub doesn't require authentication for clients (QR code access)
    // Token is optional - clients can connect without auth
    console.log('Starting SignalR order connection to:', ORDER_HUB_URL);
    
    this.orderConnection = new signalR.HubConnectionBuilder()
      .withUrl(ORDER_HUB_URL, {
        accessTokenFactory: () => {
          const currentToken = localStorage.getItem('accessToken');
          return currentToken || '';
        },
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.orderConnection.onclose((error) => {
      console.log('SignalR order connection closed', error);
    });

    this.orderConnection.onreconnecting((error) => {
      console.log('SignalR order reconnecting', error);
    });

    this.orderConnection.onreconnected((connectionId) => {
      console.log('SignalR order reconnected', connectionId);
    });

    try {
      await this.orderConnection.start();
      console.log('SignalR Order Connected successfully. Connection ID:', this.orderConnection.connectionId);
    } catch (error: any) {
      console.error('Error starting SignalR order connection:', error);
      throw error;
    }
  }

  async stopOrderConnection(): Promise<void> {
    if (this.orderConnection) {
      await this.orderConnection.stop();
      this.orderConnection = null;
      console.log('SignalR Order Disconnected');
    }
  }

  // Legacy methods for backward compatibility
  async startConnection(): Promise<void> {
    await this.startChatConnection();
  }

  async stopConnection(): Promise<void> {
    await this.stopChatConnection();
  }

  // Chat methods
  onReceiveMessage(callback: (message: any) => void): void {
    if (this.chatConnection) {
      this.chatConnection.on('ReceiveMessage', callback);
    }
  }

  offReceiveMessage(callback: (message: any) => void): void {
    if (this.chatConnection) {
      this.chatConnection.off('ReceiveMessage', callback);
    }
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.chatConnection || this.chatConnection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR chat connection is not established');
    }

    try {
      await this.chatConnection.invoke('SendMessage', message);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  getConnectionState(): signalR.HubConnectionState {
    return this.chatConnection?.state ?? signalR.HubConnectionState.Disconnected;
  }

  onConnectionStateChange(callback: (state: signalR.HubConnectionState) => void): void {
    if (this.chatConnection) {
      this.chatConnection.onclose(() => callback(signalR.HubConnectionState.Disconnected));
      this.chatConnection.onreconnecting(() => callback(signalR.HubConnectionState.Reconnecting));
      this.chatConnection.onreconnected(() => callback(signalR.HubConnectionState.Connected));
    }
  }

  // Order methods
  onOrderCreated(callback: (order: OrderResponseDto) => void): void {
    if (this.orderConnection) {
      this.orderConnection.on('OrderCreated', callback);
    }
  }

  offOrderCreated(callback: (order: OrderResponseDto) => void): void {
    if (this.orderConnection) {
      this.orderConnection.off('OrderCreated', callback);
    }
  }

  onOrderUpdated(callback: (order: OrderResponseDto) => void): void {
    if (this.orderConnection) {
      this.orderConnection.on('OrderUpdated', callback);
    }
  }

  offOrderUpdated(callback: (order: OrderResponseDto) => void): void {
    if (this.orderConnection) {
      this.orderConnection.off('OrderUpdated', callback);
    }
  }

  onOrderStatusChanged(callback: (orderId: number, status: string, tableId: number) => void): void {
    if (this.orderConnection) {
      this.orderConnection.on('OrderStatusChanged', callback);
    }
  }

  offOrderStatusChanged(callback: (orderId: number, status: string, tableId: number) => void): void {
    if (this.orderConnection) {
      this.orderConnection.off('OrderStatusChanged', callback);
    }
  }

  getOrderConnectionState(): signalR.HubConnectionState {
    return this.orderConnection?.state ?? signalR.HubConnectionState.Disconnected;
  }
}

export const signalRService = new SignalRService();
