export interface ChatMessageDto {
  userId: string | null;
  userName: string | null;
  text: string;
  timestamp: string; // DateTimeOffset from backend
}
