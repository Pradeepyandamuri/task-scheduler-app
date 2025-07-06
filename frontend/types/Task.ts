export interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string; // ISO string like "2025-07-06T10:00"
  status: "pending" | "completed";
  priority: "urgent" | "high" | "medium" | "low";
  dependencies?: number[]; // IDs of other tasks
  assigned_to_email?: string;
  user_email: string;
}
