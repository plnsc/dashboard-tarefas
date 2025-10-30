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
  Edit,
  Trash2,
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<{
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: Date;
  }>({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
  });

  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: Date;
  }>({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    dueDate: undefined,
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
      dueDate: newTask.dueDate,
    });

    setNewTask({
      title: "",
      description: "",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: undefined,
    });

    setIsAddDialogOpen(false);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleTaskClick = (task: TaskWithTags) => {
    setSelectedTask(task);
    setEditingTask({
      title: task.title,
      description: task.description || "",
      priority: task.priority || TaskPriority.MEDIUM,
      status: task.status,
      dueDate: task.dueDate,
    });
    setIsEditing(false);
    setIsDetailsOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTask) return;

    await updateTask(selectedTask.id, {
      title: editingTask.title,
      description: editingTask.description,
      priority: editingTask.priority,
      status: editingTask.status,
      dueDate: editingTask.dueDate,
    });

    // Update the selected task with the new values
    setSelectedTask({
      ...selectedTask,
      ...editingTask,
    });

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (!selectedTask) return;

    setEditingTask({
      title: selectedTask.title,
      description: selectedTask.description || "",
      priority: selectedTask.priority || TaskPriority.MEDIUM,
      status: selectedTask.status,
      dueDate: selectedTask.dueDate,
    });

    setIsEditing(false);
  };

  const renderTaskCard = (task: TaskWithTags) => (
    <Card
      key={task.id}
      className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleTaskClick(task)}
    >
      <CardHeader className="">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-base">{task.title}</h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              priorityColors[task.priority as TaskPriority] || ""
            }`}
          >
            {task.priority}
          </span>
        </div>
      </CardHeader>
      <CardContent className="">
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={
                      newTask.dueDate
                        ? new Date(newTask.dueDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        dueDate: e.target.value
                          ? new Date(e.target.value)
                          : undefined,
                      })
                    }
                  />
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
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex-1">
                      <DialogTitle className="mb-1">
                        {isEditing ? (
                          <Input
                            value={editingTask.title}
                            onChange={(e) =>
                              setEditingTask({
                                ...editingTask,
                                title: e.target.value,
                              })
                            }
                            className="text-lg"
                          />
                        ) : (
                          selectedTask.title
                        )}
                      </DialogTitle>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {isEditing ? (
                        <Select
                          value={editingTask.priority}
                          onValueChange={(value) =>
                            setEditingTask({
                              ...editingTask,
                              priority: value as TaskPriority,
                            })
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Priority" />
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
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            priorityColors[
                              selectedTask.priority as TaskPriority
                            ] || ""
                          }`}
                        >
                          {selectedTask.priority}
                        </span>
                      )}
                      {!isEditing && (
                        <span className="text-sm text-gray-500">
                          {statusLabels[selectedTask.status]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  {isEditing ? (
                    <Textarea
                      value={editingTask.description}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          description: e.target.value,
                        })
                      }
                      placeholder="Add a description..."
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-sm text-gray-700">
                      {selectedTask.description || "No description provided."}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Due Date</h3>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={
                        editingTask.dueDate
                          ? new Date(editingTask.dueDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          dueDate: e.target.value
                            ? new Date(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  ) : selectedTask.dueDate ? (
                    <p className="text-sm text-gray-700">
                      {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">No due date set</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statusLabels).map(([status, label]) => (
                      <Button
                        key={status}
                        variant={
                          (isEditing
                            ? editingTask.status
                            : selectedTask.status) === status
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          if (isEditing) {
                            setEditingTask({
                              ...editingTask,
                              status: status as TaskStatus,
                            });
                          } else {
                            handleStatusChange(
                              selectedTask.id,
                              status as TaskStatus
                            );
                            setIsDetailsOpen(false);
                          }
                        }}
                      >
                        {(isEditing
                          ? editingTask.status
                          : selectedTask.status) === status && (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-between">
                {isEditing ? (
                  <div className="flex gap-2 w-full justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveEdit}
                        disabled={!editingTask.title.trim()}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        if (
                          confirm("Are you sure you want to delete this task?")
                        ) {
                          await deleteTask(selectedTask.id);
                          setIsDetailsOpen(false);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                )}
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
