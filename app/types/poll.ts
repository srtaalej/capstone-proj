export interface Poll {
  id: number;
  name: string;
  description: string;
  endDate: string;
  options: string[];
  votes: number;
  created_at: string;
}

export interface PollFormData {
  title: string;
  description: string;
  endDate: string;
  options: string[];
} 