"use client";

import { useState } from "react";
import { TodoLists } from "./components-todo-lists";
import { TodoItems } from "./components-todo-items-new";

export default function Home() {
  const [selectedListId, setSelectedListId] = useState<string | undefined>(
    undefined,
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📝 Todo List App
          </h1>
          <p>Test1</p>
          <p>Test2</p>
          <p>Test3</p>
          <p> Test 4 </p>
          <p> Test 5 </p>
                  <p> Test 6 </p>
                  <p> Test 7 </p>
                  <p> Test 8 </p>
                  <p> Test 9 </p>
          <p className="text-gray-600">
            Manage your tasks efficiently with our modern todo application
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6">
            <TodoLists
              selectedListId={selectedListId}
              onSelectList={setSelectedListId}
            />
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <TodoItems todoListId={selectedListId} />
          </div>
        </div>
      </div>
    </div>
  );
}
