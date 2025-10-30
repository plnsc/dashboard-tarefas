"use client";

import { useState, useEffect } from "react";
import { useStore } from "./store";
import { TaskStatus, TaskPriority, type Task } from "./interfaces";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Plus,
  MoreVertical,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type TaskWithTags = Task & { tags?: any[] };

const priorityColors = {
  [TaskPriority.LOW]: "bg-blue-100 text-blue-800",
  [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-800",
  [TaskPriority.HIGH]: "bg-orange-100 text-orange-800",
  [TaskPriority.URGENT]: "bg-red-100 text-red-800",
};

const statusLabels = {
  [TaskStatus.TODO]: "To Do",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.COMPLETED]: "Completed",
  [TaskStatus.CANCELLED]: "Cancelled",
};

// Export TaskManager as both named and default export
export function TaskManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithTags | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
  }>({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
  });

  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    getTasksByStatus,
    isLoading,
  } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const todoTasks = getTasksByStatus(TaskStatus.TODO);
  const inProgressTasks = getTasksByStatus(TaskStatus.IN_PROGRESS);
  const completedTasks = getTasksByStatus(TaskStatus.COMPLETED);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;

    await addTask({
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
    });

    setNewTask({
      title: "",
      description: "",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
    });

    setIsAddDialogOpen(false);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleTaskClick = (task: TaskWithTags) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const renderTaskCard = (task: TaskWithTags) => (
    <Card
      key={task.id}
      className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleTaskClick(task)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg">{task.title}</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              priorityColors[task.priority as TaskPriority] || ""
            }`}
          >
            {task.priority}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-gray-600 line-clamp-2">
          {task.description || "No description"}
        </p>
        {task.dueDate && (
          <div className="mt-2 text-xs text-gray-500">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStatusColumn = (status: TaskStatus, tasks: TaskWithTags[]) => {
    // Only render the count if we're on the client side
    const taskCount = mounted ? tasks.length : 0;
    
    return (
      <div
        key={status}
        className="flex-1 min-w-[300px] p-4 bg-gray-50 rounded-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">{statusLabels[status]}</h2>
          <span className="text-sm text-gray-500">{taskCount}</span>
        </div>
        <div className="space-y-2">
          {mounted ? tasks.map(renderTaskCard) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task and assign it to a status.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Task description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) =>
                        setNewTask({
                          ...newTask,
                          priority: value as TaskPriority,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TaskPriority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() +
                              priority.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={newTask.status}
                      onValueChange={(value) =>
                        setNewTask({ ...newTask, status: value as TaskStatus })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {renderStatusColumn(TaskStatus.TODO, todoTasks)}
          {renderStatusColumn(TaskStatus.IN_PROGRESS, inProgressTasks)}
          {renderStatusColumn(TaskStatus.COMPLETED, completedTasks)}
        </div>
      </div>

      {/* Task Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTask.title}</DialogTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      priorityColors[selectedTask.priority as TaskPriority] ||
                      ""
                    }`}
                  >
                    {selectedTask.priority}
                  </span>
                  <span className="text-sm text-gray-500">
                    {statusLabels[selectedTask.status]}
                  </span>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm text-gray-700">
                    {selectedTask.description || "No description provided."}
                  </p>
                </div>
                {selectedTask.dueDate && (
                  <div>
                    <h3 className="text-sm font-medium mb-1">Due Date</h3>
                    <p className="text-sm text-gray-700">
                      {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium mb-2">Status</h3>
                  <div className="flex space-x-2">
                    {Object.entries(statusLabels).map(([status, label]) => (
                      <Button
                        key={status}
                        variant={
                          selectedTask.status === status ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          handleStatusChange(
                            selectedTask.id,
                            status as TaskStatus
                          );
                          setIsDetailsOpen(false);
                        }}
                      >
                        {selectedTask.status === status && (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await deleteTask(selectedTask.id);
                    setIsDetailsOpen(false);
                  }}
                >
                  Delete Task
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export as default for backward compatibility
export default TaskManager;
