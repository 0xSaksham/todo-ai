"use client";
import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { Checkbox } from "../ui/checkbox";
import Task from "./task";
import { CircleCheckBig } from "lucide-react";
import Todos from "./todos";
import CompletedTodos from "./completed-todos";
import { AddTaskWrapper } from "../add-tasks/add-task-button";
import { useEffect, useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";

export default function TodoList() {
  const [completedTodos, setCompletedTodos] = useState<Doc<"todos">[]>([]);
  const [inCompleteTodos, setInCompleteTodos] = useState<Doc<"todos">[]>([]);
  const [totalTodos, setTotalTodos] = useState(0);

  const getCompletedTodos = useAction(api.todos.completedTodos);
  const getInCompleteTodos = useAction(api.todos.inCompleteTodos);
  const getTotalTodos = useAction(api.todos.totalTodos);

  useEffect(() => {
    const fetchData = async () => {
      const [completed, incomplete, total] = await Promise.all([
        getCompletedTodos(),
        getInCompleteTodos(),
        getTotalTodos(),
      ]);

      setCompletedTodos(completed || []);
      setInCompleteTodos(incomplete || []);
      setTotalTodos(total || 0);
    };

    fetchData();
  }, [getCompletedTodos, getInCompleteTodos, getTotalTodos]);

  return (
    <div className="xl:px-40">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Inbox</h1>
      </div>
      <div className="flex flex-col gap-1 py-4">
        <Todos items={inCompleteTodos} />
      </div>
      <AddTaskWrapper />
      <div className="flex flex-col gap-1 py-4">
        <Todos items={completedTodos} />
      </div>
      <CompletedTodos totalTodos={totalTodos} />
    </div>
  );
}
