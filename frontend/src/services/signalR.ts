import * as signalR from '@microsoft/signalr';

const HUB_URL = 'http://localhost:5067/chathub';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  async startConnection(): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // Stop existing connection if any
    if (this.connection) {
      await this.stopConnection();
    }

    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No access token found. Please login first.');
    }

    console.log('Starting SignalR connection to:', HUB_URL, 'with token:', token ? 'present' : 'missing');
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => {
          const currentToken = localStorage.getItem('accessToken');
          if (!currentToken) {
            console.warn('No token available for SignalR connection');
          }
          return currentToken || '';
        },
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 10s, 30s, then 30s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Add connection event handlers for debugging
    this.connection.onclose((error) => {
      console.log('SignalR connection closed', error);
    });

    this.connection.onreconnecting((error) => {
      console.log('SignalR reconnecting', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected', connectionId);
    });

    try {
      await this.connection.start();
      console.log('SignalR Connected successfully. Connection ID:', this.connection.connectionId);
    } catch (error: any) {
      console.error('Error starting SignalR connection:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  }

  async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log('SignalR Disconnected');
    }
  }

  onReceiveMessage(callback: (message: any) => void): void {
    if (this.connection) {
      this.connection.on('ReceiveMessage', callback);
    }
  }

  offReceiveMessage(callback: (message: any) => void): void {
    if (this.connection) {
      this.connection.off('ReceiveMessage', callback);
    }
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }

    try {
      await this.connection.invoke('SendMessage', message);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  getConnectionState(): signalR.HubConnectionState {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  }

  onConnectionStateChange(callback: (state: signalR.HubConnectionState) => void): void {
    if (this.connection) {
      this.connection.onclose(() => callback(signalR.HubConnectionState.Disconnected));
      this.connection.onreconnecting(() => callback(signalR.HubConnectionState.Reconnecting));
      this.connection.onreconnected(() => callback(signalR.HubConnectionState.Connected));
    }
  }
}

export const signalRService = new SignalRService();
