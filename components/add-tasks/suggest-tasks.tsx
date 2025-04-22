import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import React, { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Loader } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

export default function SuggestMissingTasks({
  projectId,
  isSubTask = false,
  taskName = "",
  description = "",
  parentId,
}: {
  projectId: Id<"projects">;
  isSubTask?: boolean;
  taskName?: string;
  description?: string;
  parentId?: Id<"todos">;
}) {
  const [isLoadingSuggestMissingTasks, setIsLoadingSuggestMissingTasks] =
    useState(false);
  const { toast } = useToast();

  const suggestMissingTasks = useAction(api.openai.suggestMissingItemsWithAi);
  const suggestMissingSubTasks = useAction(
    api.openai.suggestMissingSubItemsWithAi
  );

  const handleMissingTasks = async () => {
    setIsLoadingSuggestMissingTasks(true);
    try {
      await suggestMissingTasks({ projectId });
      toast({
        title: "Success",
        description: "New tasks have been suggested and added to your project.",
      });
    } catch (error) {
      console.error("Error in suggestMissingTasks", error);
      let errorMessage = "Failed to suggest new tasks. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("OPENAI_API_KEY")) {
          errorMessage =
            "AI service is not properly configured. Please contact support.";
        } else if (error.message.includes("context length")) {
          errorMessage =
            "Project is too large for AI analysis. Try breaking it into smaller parts.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestMissingTasks(false);
    }
  };

  const handleMissingSubTasks = async () => {
    setIsLoadingSuggestMissingTasks(true);
    try {
      if (!parentId || !taskName || !description) {
        throw new Error("Missing required data for suggesting subtasks");
      }

      await suggestMissingSubTasks({
        projectId,
        taskName,
        description,
        parentId,
      });

      toast({
        title: "Success",
        description: "New subtasks have been suggested and added to your task.",
      });
    } catch (error) {
      console.error("Error in suggestMissingSubTasks", error);
      let errorMessage = "Failed to suggest new subtasks. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("OPENAI_API_KEY")) {
          errorMessage =
            "AI service is not properly configured. Please contact support.";
        } else if (error.message.includes("context length")) {
          errorMessage =
            "Task content is too large for AI analysis. Try simplifying the task description.";
        } else if (error.message.includes("Missing required data")) {
          errorMessage =
            "Please provide all required task information before requesting suggestions.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestMissingTasks(false);
    }
  };

  return (
    <>
      <Button
        variant={"outline"}
        disabled={isLoadingSuggestMissingTasks}
        onClick={isSubTask ? handleMissingSubTasks : handleMissingTasks}
      >
        {isLoadingSuggestMissingTasks ? (
          <div className="flex gap-2">
            Loading Tasks (AI)
            <Loader className="h-5 w-5 text-primary" />
          </div>
        ) : (
          "Suggest Missing Tasks (AI) 💖"
        )}
      </Button>
    </>
  );
}
