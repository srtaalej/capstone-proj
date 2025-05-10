export interface Poll {
  id:string
  title: string;
  description: string;
  end_date: string;
  is_private: boolean;
  options: Option[];
  created_at: string;
}

export interface Option {
  text: string;
  vote_count: number;
  poll_id: string;
}


export interface PollFormData {
  title: string;
  description: string;
  end_date: string;
  is_private: boolean;
  options: string[];
} 