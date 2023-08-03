export type MessageState = {
  content: string;
  role: 'user' | 'assistant' | 'system';
  source?: string;
};
