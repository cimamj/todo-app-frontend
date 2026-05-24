"use client";

import { useEffect, useState } from "react";
import {
  todoItemsApi,
  TodoItem,
  TodoItemCreateDto,
  TodoItemUpdateDto,
  getApiErrorMessage,
} from "./api-client";
import { Button } from "./button";
import { DatePicker } from "./date-picker";
import { Input } from "./input";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface TodoItemsProps {
  todoListId?: string;
}

const MAX_ITEM_TITLE_LENGTH = 200;
const MAX_ITEM_DESCRIPTION_LENGTH = 1000;

const toDateValue = (value: string) => {
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const getTomorrowDateValue = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
};

const isFutureDate = (value: string) => {
  if (!value) return true;
  const selected = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected > today;
};

export function TodoItems({ todoListId }: TodoItemsProps) {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

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
    if (!todoListId) return;
    if (!newTitle.trim()) {
      setError("Title is required.");
      return;
    }
    if (newTitle.length > MAX_ITEM_TITLE_LENGTH) {
      setError(`Title cannot exceed ${MAX_ITEM_TITLE_LENGTH} characters.`);
      return;
    }
    if (newDescription.length > MAX_ITEM_DESCRIPTION_LENGTH) {
      setError(
        `Description cannot exceed ${MAX_ITEM_DESCRIPTION_LENGTH} characters.`,
      );
      return;
    }
    if (newDueDate && !isFutureDate(newDueDate)) {
      setError("Due date must be after today.");
      return;
    }

    try {
      const dto: TodoItemCreateDto = {
        todoListId,
        title: newTitle,
        description: newDescription || undefined,
        dueDate: newDueDate ? new Date(newDueDate).toISOString() : undefined,
      };
      await todoItemsApi.create(dto);
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
      setError(null);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err));
      console.error(err);
    }
  };

  const handleToggle = async (id: string, isCompleted: boolean) => {
    try {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;

      const dto: TodoItemUpdateDto = {
        title: item.title,
        description: item.description,
        dueDate: item.dueDate,
        isCompleted: !isCompleted,
      };

      await todoItemsApi.update(id, dto);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err));
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

  const startEdit = (item: TodoItem) => {
    setEditingItemId(item.id);
    setEditTitle(item.title || "");
    setEditDescription(item.description || "");
    setEditDueDate(item.dueDate ? toDateValue(item.dueDate) : "");
  };

  const handleSaveEdit = async (item: TodoItem) => {
    if (!editTitle.trim()) {
      setError("Title is required.");
      return;
    }
    if (editTitle.length > MAX_ITEM_TITLE_LENGTH) {
      setError(`Title cannot exceed ${MAX_ITEM_TITLE_LENGTH} characters.`);
      return;
    }
    if (editDescription.length > MAX_ITEM_DESCRIPTION_LENGTH) {
      setError(
        `Description cannot exceed ${MAX_ITEM_DESCRIPTION_LENGTH} characters.`,
      );
      return;
    }
    if (editDueDate && !isFutureDate(editDueDate)) {
      setError("Due date must be after today.");
      return;
    }

    try {
      const dto: TodoItemUpdateDto = {
        title: editTitle || undefined,
        description: editDescription || undefined,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
        isCompleted: item.isCompleted,
      };
      await todoItemsApi.update(item.id, dto);
      setEditingItemId(null);
      setError(null);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err));
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditTitle("");
    setEditDescription("");
    setEditDueDate("");
  };

  if (!todoListId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Todo Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 text-sm">
            Select a todo list to view items
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todo Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleCreate}
          className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="grid gap-2 md:grid-cols-[2fr_1fr]">
            <Input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add new item title..."
            />
            <DatePicker
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              min={getTomorrowDateValue()}
            />
          </div>
          <Input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
          />
          <Button type="submit" variant="secondary" className="w-full">
            Add Item
          </Button>
        </form>

        {loading ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No items yet
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {items.map((item) => {
              const isEditing = editingItemId === item.id;
              return (
                <div
                  key={item.id}
                  className={`p-3 border rounded-lg transition bg-white ${
                    isEditing
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:shadow-md"
                  }`}
                  onClick={() => !isEditing && startEdit(item)}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid gap-2 md:grid-cols-[2fr_1fr]">
                        <Input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Title"
                        />
                        <DatePicker
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          min={getTomorrowDateValue()}
                        />
                      </div>
                      <Input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleSaveEdit(item)}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggle(item.id, item.isCompleted);
                        }}
                        className="w-4 h-4 cursor-pointer shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className={`text-sm font-medium block ${
                              item.isCompleted
                                ? "line-through text-gray-400"
                                : "text-gray-800"
                            }`}
                          >
                            {item.title || "Untitled"}
                          </span>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            variant="destructive"
                            size="sm"
                            className="shrink-0"
                          >
                            Delete
                          </Button>
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {item.description}
                          </p>
                        )}
                        {item.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
