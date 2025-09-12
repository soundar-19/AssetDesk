export interface Message {
  id: number;
  sender: any;
  recipient: any;
  subject: string;
  content: string;
  sentAt: string;
  readAt?: string;
  read: boolean;
}

export interface MessageRequest {
  recipientId: number;
  subject: string;
  content: string;
}