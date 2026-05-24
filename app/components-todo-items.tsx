"use client";

import { useEffect, useState } from "react";
import {
  todoItemsApi,
  TodoItem,
  TodoItemCreateDto,
  TodoItemUpdateDto,
} from "./api-client";

interface TodoItemsProps {
  todoListId?: string;
}

export function TodoItems({ todoListId }: TodoItemsProps) {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  useEffect(() => {
    loadItems();
  }, [todoListId]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await todoItemsApi.getAll();
      const filtered = todoListId
        ? response.data.filter((item) => item.todoListId === todoListId)
        : response.data;
      setItems(filtered);
      setError(null);
    } catch (err) {
      setError("Failed to load todo items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoListId || !newTitle.trim()) return;

    try {
      const dto: TodoItemCreateDto = {
        todoListId,
        title: newTitle,
        dueDate: newDueDate || undefined,
      };
      await todoItemsApi.create(dto);
      setNewTitle("");
      setNewDueDate("");
      await loadItems();
    } catch (err) {
      setError("Failed to create todo item");
      console.error(err);
    }
  };

  const handleToggle = async (id: string, isCompleted: boolean) => {
    try {
      const dto: TodoItemUpdateDto = {
        isCompleted: !isCompleted,
      };
      await todoItemsApi.update(id, dto);
      await loadItems();
    } catch (err) {
      setError("Failed to update todo item");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await todoItemsApi.delete(id);
      await loadItems();
    } catch (err) {
      setError("Failed to delete todo item");
      console.error(err);
    }
  };

  if (!todoListId) {
    return (
      <div className="text-center py-8 text-gray-500">
        Select a todo list to view items
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Todo Items</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
      >
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add new item..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="datetime-local"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Add Item
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No items yet</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition bg-white"
            >
              <input
                type="checkbox"
                checked={item.isCompleted}
                onChange={() => handleToggle(item.id, item.isCompleted)}
                className="w-5 h-5 cursor-pointer"
              />
              <div className="flex-1">
                <span
                  className={`text-lg ${
                    item.isCompleted
                      ? "line-through text-gray-400"
                      : "text-gray-800"
                  }`}
                >
                  {item.title || "Untitled"}
                </span>
                {item.dueDate && (
                  <p className="text-sm text-gray-500">
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
