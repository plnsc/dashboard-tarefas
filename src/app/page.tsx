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
  Text,
  FileText,
  AlertCircle,
  ListTodo,
  Calendar,
  RefreshCw,
  X as XIcon,
} from "lucide-react";

type TaskWithTags = Task & { tags?: any[] };

const priorityColors = {
  [TaskPriority.LOW]: "bg-blue-100 text-blue-800",
  [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-800",
  [TaskPriority.HIGH]: "bg-orange-100 text-orange-800",
  [TaskPriority.URGENT]: "bg-red-100 text-red-800",
};

const statusLabels = {
  [TaskStatus.TODO]: "A Fazer",
  [TaskStatus.IN_PROGRESS]: "Em Andamento",
  [TaskStatus.COMPLETED]: "Concluído",
  [TaskStatus.CANCELLED]: "Cancelado",
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
    if (!newTask.title.trim()) return; // Verifica se o título não está vazio

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

  const handleTaskClick = (task: TaskWithTags | null) => {
    if (!task) return;
    
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

    const updatedTask = {
      title: editingTask.title,
      description: editingTask.description,
      priority: editingTask.priority,
      status: editingTask.status,
      dueDate: editingTask.dueDate ? new Date(editingTask.dueDate) : undefined,
    };

    await updateTask(selectedTask.id, updatedTask);

    // Update the selected task with the new values
    setSelectedTask({
      ...selectedTask,
      ...updatedTask,
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
      dueDate: selectedTask.dueDate ? new Date(selectedTask.dueDate) : undefined,
    });

    setIsEditing(false);
  };

  const renderTaskCard = (task: TaskWithTags) => {
    const priorityIcons = {
      [TaskPriority.LOW]: <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />,
      [TaskPriority.MEDIUM]: <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />,
      [TaskPriority.HIGH]: <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />,
      [TaskPriority.URGENT]: (
        <AlertCircle className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
      ),
    };

    const priority = task.priority || TaskPriority.MEDIUM;
    const priorityLabel = {
      [TaskPriority.LOW]: 'Baixa',
      [TaskPriority.MEDIUM]: 'Média',
      [TaskPriority.HIGH]: 'Alta',
      [TaskPriority.URGENT]: 'Urgente'
    }[priority];

    return (
      <Card
        key={task.id}
        role="button"
        tabIndex={0}
        aria-label={`Tarefa: ${task.title}, Prioridade: ${priorityLabel}${task.dueDate ? `, Vence em: ${new Date(task.dueDate).toLocaleDateString('pt-BR')}` : ''}`}
        className="mb-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => handleTaskClick(task)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTaskClick(task);
          }
        }}
      >
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 flex items-start gap-2">
              <div className="mt-0.5">
                <ListTodo className="h-4 w-4 text-gray-400" />
              </div>
              <h3 className="font-medium text-base">{task.title}</h3>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                  priorityColors[priority] || ""
                }`}
              >
                {priorityIcons[priority]}
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-3">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            {task.description ? (
              <>
                <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="line-clamp-2">{task.description}</p>
              </>
            ) : (
              <p className="text-gray-400 italic flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Sem descrição
              </p>
            )}
          </div>
          {task.dueDate && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Vence em {new Date(task.dueDate).toLocaleDateString("pt-BR")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderStatusColumn = (status: TaskStatus, tasks: TaskWithTags[]) => {
    // Only render the count if we're on the client side
    const taskCount = mounted ? tasks.length : 0;
    const statusId = `status-${status.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <section
        key={status}
        aria-labelledby={statusId}
        className="flex-1 min-w-[300px] p-4 bg-gray-50 rounded-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id={statusId} className="font-semibold text-lg">
            {statusLabels[status]}
          </h2>
          <span className="text-sm text-gray-500" aria-live="polite">
            {taskCount} {taskCount === 1 ? 'tarefa' : 'tarefas'}
          </span>
        </div>
        <div 
          role="region" 
          aria-label={`Lista de tarefas ${statusLabels[status].toLowerCase()}`}
          className="space-y-2"
        >
          {mounted ? tasks.map(renderTaskCard) : null}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800" id="main-heading">
            Gerenciador de Tarefas
          </h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button aria-label="Adicionar nova tarefa">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Adicionar Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle id="add-task-dialog-title">Adicionar Nova Tarefa</DialogTitle>
                <DialogDescription id="add-task-dialog-description">
                  Preencha os detalhes abaixo para criar uma nova tarefa.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4" role="form" aria-labelledby="add-task-dialog-title" aria-describedby="add-task-dialog-description">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Text className="h-4 w-4 text-muted-foreground" />
                    <label htmlFor="task-title" className="text-sm font-medium">Título</label>
                  </div>
                  <Input
                    id="task-title"
                    placeholder="Título da tarefa"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <label htmlFor="task-description" className="text-sm font-medium">Descrição</label>
                  </div>
                  <Textarea
                    id="task-description"
                    placeholder="Descrição da tarefa"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <label id="priority-label" className="text-sm font-medium">Prioridade</label>
                    </div>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) =>
                        setNewTask({
                          ...newTask,
                          priority: value as TaskPriority,
                        })
                      }
                      aria-labelledby="priority-label"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
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
                    <div className="flex items-center space-x-2">
                      <ListTodo className="h-4 w-4 text-muted-foreground" />
                      <label id="status-label" className="text-sm font-medium">Status</label>
                    </div>
                    <Select
                      value={newTask.status}
                      onValueChange={(value) =>
                        setNewTask({ ...newTask, status: value as TaskStatus })
                      }
                      aria-labelledby="status-label"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
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
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <label htmlFor="due-date" className="text-sm font-medium">
                      Data de Vencimento
                    </label>
                  </div>
                  <Input
                    id="due-date"
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
              <DialogFooter className="justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="gap-2"
                  aria-label="Cancelar e fechar diálogo"
                >
                  <XIcon className="h-4 w-4" aria-hidden="true" />
                  <span>Cancelar</span>
                </Button>
                <Button
                  onClick={handleAddTask}
                  className="gap-2"
                  disabled={!newTask.title.trim()}
                  aria-disabled={!newTask.title.trim()}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Adicionar Tarefa</span>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>
        
        <main>
          <div className="flex flex-col md:flex-row gap-6" role="main" aria-labelledby="main-heading">
            {renderStatusColumn(TaskStatus.TODO, todoTasks)}
            {renderStatusColumn(TaskStatus.IN_PROGRESS, inProgressTasks)}
            {renderStatusColumn(TaskStatus.COMPLETED, completedTasks)}
          </div>
        </main>
      </div>

      {/* Task Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <ListTodo className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <DialogTitle className="mb-1">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingTask.title}
                                onChange={(e) =>
                                  setEditingTask({
                                    ...editingTask,
                                    title: e.target.value,
                                  })
                                }
                                className="text-lg flex-1"
                              />
                            </div>
                          ) : (
                            selectedTask.title
                          )}
                        </DialogTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 pl-8">
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
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Prioridade" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(TaskPriority).map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                <div className="flex items-center gap-2">
                                  {priority === TaskPriority.LOW && (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  )}
                                  {priority === TaskPriority.MEDIUM && (
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  )}
                                  {[
                                    TaskPriority.HIGH,
                                    TaskPriority.URGENT,
                                  ].includes(priority) && (
                                    <AlertCircle
                                      className={`h-3.5 w-3.5 ${
                                        priority === TaskPriority.URGENT
                                          ? "fill-current"
                                          : ""
                                      }`}
                                    />
                                  )}
                                  <span>
                                    {priority.charAt(0).toUpperCase() +
                                      priority.slice(1)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                            priorityColors[
                              (selectedTask.priority ||
                                TaskPriority.MEDIUM) as TaskPriority
                            ] || ""
                          }`}
                        >
                          {(selectedTask.priority || TaskPriority.MEDIUM) ===
                            TaskPriority.LOW && (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                          {(selectedTask.priority || TaskPriority.MEDIUM) ===
                            TaskPriority.MEDIUM && (
                            <ChevronUp className="h-3.5 w-3.5" />
                          )}
                          {[TaskPriority.HIGH, TaskPriority.URGENT].includes(
                            (selectedTask.priority ||
                              TaskPriority.MEDIUM) as TaskPriority
                          ) && (
                            <AlertCircle
                              className={`h-3.5 w-3.5 ${
                                (selectedTask.priority ||
                                  TaskPriority.MEDIUM) === TaskPriority.URGENT
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                          )}
                          <span>
                            {(selectedTask.priority || TaskPriority.MEDIUM)
                              .charAt(0)
                              .toUpperCase() +
                              (
                                selectedTask.priority || TaskPriority.MEDIUM
                              ).slice(1)}
                          </span>
                        </span>
                      )}
                      {!isEditing && (
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                          {statusLabels[selectedTask.status]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-5 py-2 px-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <h3 className="text-sm font-medium">Descrição</h3>
                  </div>
                  {isEditing ? (
                    <Textarea
                      value={editingTask.description}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          description: e.target.value,
                        })
                      }
                      placeholder="Adicione uma descrição..."
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 pl-6">
                      {selectedTask.description || (
                        <span className="text-gray-400 italic">
                          Nenhuma descrição fornecida
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <h3 className="text-sm font-medium">Data de Vencimento</h3>
                  </div>
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
                      className="max-w-[200px]"
                    />
                  ) : selectedTask.dueDate ? (
                    <p className="text-sm text-gray-700 pl-6">
                      {new Date(selectedTask.dueDate).toLocaleDateString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic pl-6">
                      Nenhuma data definida
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <ListTodo className="h-4 w-4 text-gray-500" />
                    <h3 className="text-sm font-medium">Status</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-6">
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
                        className="gap-2"
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
                          <Check className="h-3.5 w-3.5" />
                        )}
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-between pt-2">
                {isEditing ? (
                  <div className="flex gap-2 w-full justify-end">
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="gap-2"
                    >
                      <XIcon className="h-4 w-4" />
                      <span>Cancelar</span>
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      disabled={!editingTask.title.trim()}
                      className="gap-2"
                    >
                      <Check className="h-4 w-4" />
                      <span>Salvar alterações</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full justify-end">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          if (
                            window.confirm(
                              "Tem certeza que deseja excluir esta tarefa?"
                            )
                          ) {
                            await deleteTask(selectedTask.id);
                            setIsDetailsOpen(false);
                          }
                        }}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Excluir</span>
                      </Button>
                    </div>
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
