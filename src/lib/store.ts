import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Task,
  TaskStatus,
  TaskPriority,
  Tag,
  Login,
  RootTask,
  SubTask,
  CreateTaskDTO,
  UpdateTaskDTO,
  CreateTagDTO,
  UpdateTagDTO,
} from "./interfaces";

interface TaskState {
  tasks: (Task & { tags?: Tag[] })[];
  tags: Tag[];
  currentUser: Omit<Login, "password"> | null;
  isLoading: boolean;
  error: string | null;

  // Task actions
  addTask: (task: CreateTaskDTO) => Promise<void>;
  updateTask: (id: string, updates: Partial<UpdateTaskDTO>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (
    id: string,
    newParentId: string | undefined,
    newIndex: number
  ) => void;
  toggleTaskStatus: (id: string) => void;

  // Tag actions
  addTag: (tag: CreateTagDTO) => Promise<void>;
  updateTag: (id: string, updates: Partial<UpdateTagDTO>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;

  // Helper functions
  getTaskById: (id: string) => (Task & { tags?: Tag[] }) | undefined;
  getTasksByParentId: (parentId?: string) => (Task & { tags?: Tag[] })[];
  getTagsForTask: (taskId: string) => Tag[];
  getTasksByStatus: (status: TaskStatus) => (Task & { tags?: Tag[] })[];
  getTasksByTag: (tagId: string) => (Task & { tags?: Tag[] })[];
}

export const useStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      tags: [],
      currentUser: null,
      isLoading: false,
      error: null,

      // Task actions
      addTask: async (taskData: CreateTaskDTO) => {
        try {
          set({ isLoading: true });
          // In a real app, you would make an API call here
          const newTask: Task = {
            ...taskData,
            id: Date.now().toString(),
            userId: get().currentUser?.id || "",
            status: taskData.status || TaskStatus.TODO,
            subtasks: [],
            order: get().getTasksByParentId(taskData.parentId).length,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            tasks: [...state.tasks, newTask],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to add task", isLoading: false });
        }
      },

      updateTask: async (id: string, updates: Partial<UpdateTaskDTO>) => {
        try {
          set({ isLoading: true });
          // In a real app, you would make an API call here

          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, ...updates, updatedAt: new Date() }
                : task
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to update task", isLoading: false });
        }
      },

      deleteTask: async (id: string) => {
        try {
          set({ isLoading: true });
          // In a real app, you would make an API call here

          // Recursive function to get all descendant task IDs
          const getAllDescendantIds = (taskId: string): string[] => {
            const children = get().getTasksByParentId(taskId);
            return children.reduce<string[]>((acc, child) => {
              return [...acc, child.id, ...getAllDescendantIds(child.id)];
            }, []);
          };

          const idsToDelete = [id, ...getAllDescendantIds(id)];

          set((state) => ({
            tasks: state.tasks.filter((task) => !idsToDelete.includes(task.id)),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to delete task", isLoading: false });
        }
      },

      moveTask: (
        id: string,
        newParentId: string | undefined,
        newIndex: number
      ) => {
        set((state) => {
          const taskToMove = state.tasks.find((t) => t.id === id);
          if (!taskToMove) return state;

          // Prevent moving a task into its own subtree
          if (newParentId) {
            let currentParentId: string | undefined = newParentId;
            while (currentParentId) {
              if (currentParentId === id) return state; // Would create a cycle
              const parent = state.tasks.find((t) => t.id === currentParentId);
              currentParentId = parent?.parentId;
            }
          }

          // Remove from old position
          const tasksWithoutMoved = state.tasks.filter((t) => t.id !== id);

          // Update order of siblings in old parent
          const oldSiblings = tasksWithoutMoved.filter(
            (t) => t.parentId === taskToMove.parentId
          );

          const reorderedOldSiblings = oldSiblings
            .filter((t) => t.id !== id)
            .sort((a, b) => a.order - b.order)
            .map((task, index) => ({
              ...task,
              order: index < newIndex ? index : index + 1,
            }));

          // Update order of siblings in new parent
          const newSiblings = tasksWithoutMoved.filter(
            (t) => t.parentId === newParentId && t.id !== id
          );

          const reorderedNewSiblings = newSiblings.map((task) => ({
            ...task,
            order: task.order >= newIndex ? task.order + 1 : task.order,
          }));

          // Update the moved task
          const updatedTask = {
            ...taskToMove,
            parentId: newParentId,
            order: newIndex,
            updatedAt: new Date(),
          };

          // Combine all tasks
          const otherTasks = tasksWithoutMoved.filter(
            (t) =>
              t.parentId !== taskToMove.parentId && t.parentId !== newParentId
          );

          return {
            tasks: [
              ...otherTasks,
              ...reorderedOldSiblings,
              ...reorderedNewSiblings,
              updatedTask,
            ],
          };
        });
      },

      toggleTaskStatus: (id: string) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return state;

          const newStatus =
            task.status === TaskStatus.COMPLETED
              ? TaskStatus.TODO
              : TaskStatus.COMPLETED;

          // Update the task status
          const updatedTask = {
            ...task,
            status: newStatus,
            completedAt:
              newStatus === TaskStatus.COMPLETED ? new Date() : undefined,
            updatedAt: new Date(),
          };

          return {
            tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
          };
        });
      },

      // Tag actions
      addTag: async (tagData: CreateTagDTO) => {
        try {
          set({ isLoading: true });
          // In a real app, you would make an API call here
          const newTag: Tag = {
            ...tagData,
            id: Date.now().toString(),
            userId: get().currentUser?.id || "",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            tags: [...state.tags, newTag],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to add tag", isLoading: false });
        }
      },

      updateTag: async (id: string, updates: Partial<UpdateTagDTO>) => {
        try {
          set({ isLoading: true });
          // In a real app, you would make an API call here

          set((state) => ({
            tags: state.tags.map((tag) =>
              tag.id === id
                ? { ...tag, ...updates, updatedAt: new Date() }
                : tag
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to update tag", isLoading: false });
        }
      },

      deleteTag: async (id: string) => {
        try {
          set({ isLoading: true });
          // In a real app, you would make an API call here

          // Remove tag from any tasks that have it
          set((state) => ({
            tasks: state.tasks.map((task) => ({
              ...task,
              tagIds: task.tagIds?.filter((tagId) => tagId !== id) || [],
            })),
            tags: state.tags.filter((tag) => tag.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to delete tag", isLoading: false });
        }
      },

      // Auth actions
      login: async (email: string, password: string): Promise<boolean> => {
        try {
          set({ isLoading: true });
          // In a real app, you would make an API call here
          // For demo purposes, we'll simulate a successful login
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // This would come from your API response
          const mockUser: Omit<Login, "password"> = {
            id: "user-1",
            email,
            username: email.split("@")[0],
            isActive: true,
            createdAt: new Date(),
            lastLoginAt: new Date(),
          };

          set({ currentUser: mockUser, isLoading: false });
          return true;
        } catch (error) {
          set({ error: "Login failed", isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ currentUser: null });
      },

      register: async (
        username: string,
        email: string,
        password: string
      ): Promise<boolean> => {
        try {
          set({ isLoading: true });
          // In a real app, you would make an API call here
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Simulate successful registration and login
          const newUser: Omit<Login, "password"> = {
            id: `user-${Date.now()}`,
            email,
            username,
            isActive: true,
            createdAt: new Date(),
          };

          set({ currentUser: newUser, isLoading: false });
          return true;
        } catch (error) {
          set({ error: "Registration failed", isLoading: false });
          return false;
        }
      },

      // Helper functions
      getTaskById: (id: string) => {
        return get().tasks.find((task) => task.id === id);
      },

      getTasksByParentId: (parentId?: string) => {
        return get()
          .tasks.filter((task) => task.parentId === parentId)
          .sort((a, b) => a.order - b.order);
      },

      getTagsForTask: (taskId: string) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task?.tagIds?.length) return [];

        return get().tags.filter((tag) => task.tagIds?.includes(tag.id));
      },

      getTasksByStatus: (status: TaskStatus) => {
        return get().tasks.filter((task) => task.status === status);
      },

      getTasksByTag: (tagId: string) => {
        return get().tasks.filter((task) => task.tagIds?.includes(tagId));
      },
    }),
    {
      name: "task-manager-storage",
      partialize: (state) => ({
        tasks: state.tasks,
        tags: state.tags,
        currentUser: state.currentUser,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);

export default useStore;
