import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface TodoItemCreateDto {
  todoListId: string;
  title?: string;
  description?: string;
  dueDate?: string;
}

export interface TodoItemUpdateDto {
  title?: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
}

export interface TodoListCreateDto {
  title?: string;
}

export interface TodoListUpdateDto {
  title?: string;
}

export interface TodoItem {
  id: string;
  todoListId: string;
  title?: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
}

export interface TodoList {
  id: string;
  title?: string;
  items?: TodoItem[];
}

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.errors) return String(data.errors);
    if (data?.error) return String(data.error);
    if (data?.message) return String(data.message);
    return error.message || "An API error occurred";
  }

  if (error instanceof Error) return error.message;
  return String(error);
};

export const todoItemsApi = {
  getAll: () => apiClient.get<TodoItem[]>("/api/TodoItems"),
  getById: (id: string) => apiClient.get<TodoItem>(`/api/TodoItems/${id}`),
  create: (data: TodoItemCreateDto) =>
    apiClient.post<TodoItem>("/api/TodoItems", data),
  update: (id: string, data: TodoItemUpdateDto) =>
    apiClient.put<TodoItem>(`/api/TodoItems/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/TodoItems/${id}`),
};

export const todoListsApi = {
  getAll: () => apiClient.get<TodoList[]>("/api/TodoLists"),
  getById: (id: string) => apiClient.get<TodoList>(`/api/TodoLists/${id}`),
  create: (data: TodoListCreateDto) =>
    apiClient.post<TodoList>("/api/TodoLists", data),
  update: (id: string, data: TodoListUpdateDto) =>
    apiClient.put<TodoList>(`/api/TodoLists/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/TodoLists/${id}`),
};

export default apiClient;
