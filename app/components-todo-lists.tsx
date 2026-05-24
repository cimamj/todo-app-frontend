"use client";

import { useEffect, useState } from "react";
import { todoListsApi, TodoList, getApiErrorMessage } from "./api-client";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

const TODO_LIST_TITLE_MAX_LENGTH = 200;

interface TodoListsProps {
  selectedListId?: string;
  onSelectList: (id: string | undefined) => void;
}

export function TodoLists({ selectedListId, onSelectList }: TodoListsProps) {
  const [lists, setLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListTitle, setEditListTitle] = useState("");

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      setLoading(true);
      const response = await todoListsApi.getAll();
      setLists(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load todo lists");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError("Todo list title is required.");
      return;
    }
    if (newTitle.length > TODO_LIST_TITLE_MAX_LENGTH) {
      setError(
        `Todo list title cannot exceed ${TODO_LIST_TITLE_MAX_LENGTH} characters.`,
      );
      return;
    }

    try {
      await todoListsApi.create({ title: newTitle });
      setNewTitle("");
      setError(null);
      await loadLists();
    } catch (err) {
      setError(getApiErrorMessage(err));
      console.error(err);
    }
  };

  const startEditList = (list: TodoList) => {
    setEditingListId(list.id);
    setEditListTitle(list.title || "");
  };

  const handleSaveList = async (id: string) => {
    if (!editListTitle.trim()) {
      setError("Todo list title is required.");
      return;
    }
    if (editListTitle.length > TODO_LIST_TITLE_MAX_LENGTH) {
      setError(
        `Todo list title cannot exceed ${TODO_LIST_TITLE_MAX_LENGTH} characters.`,
      );
      return;
    }

    try {
      await todoListsApi.update(id, { title: editListTitle || undefined });
      setEditingListId(null);
      setEditListTitle("");
      setError(null);
      await loadLists();
    } catch (err) {
      setError(getApiErrorMessage(err));
      console.error(err);
    }
  };

  const cancelEditList = () => {
    setEditingListId(null);
    setEditListTitle("");
  };

  const handleDelete = async (id: string) => {
    try {
      await todoListsApi.delete(id);
      if (selectedListId === id) {
        onSelectList(undefined);
      }
      if (editingListId === id) {
        cancelEditList();
      }
      await loadLists();
    } catch (err) {
      setError("Failed to delete todo list");
      console.error(err);
    }
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>My Lists</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="flex gap-2">
            <Input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Create new todo list..."
            />
            <Button type="submit">Add</Button>
          </form>

          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Loading...
            </div>
          ) : lists.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No todo lists yet
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {lists.map((list) => {
                const isSelected = selectedListId === list.id;
                const isEditing = editingListId === list.id;
                return (
                  <div
                    key={list.id}
                    className={`p-3 border rounded-lg transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 bg-white hover:shadow-md"
                    }`}
                    onClick={() => onSelectList(list.id)}
                  >
                    <div className="flex flex-col gap-3">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            type="text"
                            value={editListTitle}
                            onChange={(e) => setEditListTitle(e.target.value)}
                            placeholder="Edit list title"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={cancelEditList}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveList(list.id)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {list.title || "Untitled List"}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                              ID: {list.id.substring(0, 8)}...
                            </p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditList(list);
                              }}
                              variant="secondary"
                              size="sm"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(list.id);
                              }}
                              variant="destructive"
                              size="sm"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
