// interfaces.ts

/**
 * User login and authentication
 */
export interface Login {
  id: string;
  email: string;
  password?: string; // Optional as it shouldn't be exposed in most contexts
  username: string;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

/**
 * Activity logs for tracking user actions and system events
 */
export interface Log {
  id: string;
  userId: string;
  action: string;
  entityType?: "task" | "tag" | "login";
  entityId?: string;
  timestamp: Date;
  details?: string;
  metadata?: Record<string, any>;
}

/**
 * Tags for categorizing and organizing tasks
 */
export interface Tag {
  id: string;
  name: string;
  color?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task that can contain nested subtasks (which are also tasks)
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  userId: string;
  status: TaskStatus;
  priority?: TaskPriority;
  tagIds?: string[];
  parentId?: string; // Reference to parent task if this is a subtask
  subtasks: Task[]; // Nested tasks (recursive structure)
  order: number; // Order within parent's subtask list
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Enums and Types
 */
export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TaskPriority {
  LOW = "low",
  NORMAL = "normal",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

/**
 * Extended types with relations
 */
export interface TaskWithTags extends Task {
  tags?: Tag[];
}

export interface LogWithUser extends Log {
  user?: Pick<Login, "id" | "username" | "email">;
}

/**
 * Helper type for tasks at different levels
 */
export interface RootTask extends Task {
  parentId: undefined; // Root tasks have no parent
}

export interface SubTask extends Task {
  parentId: string; // Subtasks always have a parent
}

/**
 * Request/Response DTOs
 */
export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tagIds?: string[];
  parentId?: string; // Optional parent ID for creating subtasks
  order?: number;
  dueDate?: Date;
}

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {
  id: string;
}

export interface CreateTagDTO {
  name: string;
  color?: string;
}

export interface UpdateTagDTO extends Partial<CreateTagDTO> {
  id: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO extends LoginDTO {
  username: string;
}

export interface AuthResponse {
  user: Omit<Login, "password">;
  token: string;
}

/**
 * Utility types for working with task hierarchies
 */
export interface FlatTask extends Omit<Task, "subtasks"> {
  // Flattened task without nested subtasks (useful for database storage)
  subtasks?: never;
}

export interface TaskTreeNode extends Task {
  depth: number; // Helper for rendering nested levels
  hasChildren: boolean;
}
