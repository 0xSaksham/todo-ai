import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";
import OpenAI from "openai";
import { Id } from "./_generated/dataModel";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}
const openai = new OpenAI({ apiKey });

const AI_LABEL_ID = "k17fvzswh0s2mmee1fvg83bp297ehwk1";

export const suggestMissingItemsWithAi = action({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    try {
      const todos = await ctx.runQuery(api.todos.getTodosByProjectId, {
        projectId,
      });

      const project = await ctx.runQuery(api.projects.getProjectByProjectId, {
        projectId,
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const response = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "I'm a project manager and I need help identifying missing to-do items. I have a list of existing tasks in JSON format, containing objects with 'taskName' and 'description' properties. I also have a good understanding of the project scope. Can you help me identify 5 additional to-do items for the project with projectName that are not yet included in this list? Please provide these missing items in a separate JSON array with the key 'todos' containing objects with 'taskName' and 'description' properties. Ensure there are no duplicates between the existing list and the new suggestions.",
          },
          {
            role: "user",
            content: JSON.stringify({
              todos,
              projectName: project.name,
            }),
          },
        ],
        response_format: { type: "json_object" },
        model: "gpt-3.5-turbo",
      });

      const messageContent = response.choices[0]?.message?.content;
      if (!messageContent) {
        throw new Error("No suggestions received from AI");
      }

      try {
        const parsedContent = JSON.parse(messageContent);
        const items = parsedContent?.todos;

        if (!Array.isArray(items)) {
          throw new Error("Invalid response format from AI");
        }

        for (const item of items) {
          if (!item.taskName || typeof item.taskName !== "string") {
            throw new Error("Invalid task name in AI response");
          }

          const embedding = await getEmbeddingsWithAI(item.taskName);
          await ctx.runMutation(api.todos.createATodo, {
            taskName: item.taskName,
            description: item.description || "",
            priority: 1,
            dueDate: new Date().getTime(),
            projectId,
            labelId: AI_LABEL_ID as Id<"labels">,
            embedding,
          });
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown error parsing AI response";
        throw new Error(`Failed to process AI response: ${message}`);
      }
    } catch (error) {
      console.error("Error in suggestMissingItemsWithAi:", error);
      throw error;
    }
  },
});

export const suggestMissingSubItemsWithAi = action({
  args: {
    projectId: v.id("projects"),
    parentId: v.id("todos"),
    taskName: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { projectId, parentId, taskName, description }) => {
    try {
      const todos = await ctx.runQuery(api.subTodos.getSubTodosByParentId, {
        parentId,
      });

      const project = await ctx.runQuery(api.projects.getProjectByProjectId, {
        projectId,
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const response = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "I'm a project manager and I need help identifying missing sub tasks for a parent todo. I have a list of existing sub tasks in JSON format, containing objects with 'taskName' and 'description' properties. I also have a good understanding of the project scope. Can you help me identify 2 additional sub tasks that are not yet included in this list? Please provide these missing items in a separate JSON array with the key 'todos' containing objects with 'taskName' and 'description' properties. Ensure there are no duplicates between the existing list and the new suggestions.",
          },
          {
            role: "user",
            content: JSON.stringify({
              todos,
              projectName: project.name,
              parentTodo: { taskName, description },
            }),
          },
        ],
        response_format: { type: "json_object" },
        model: "gpt-3.5-turbo",
      });

      const messageContent = response.choices[0]?.message?.content;
      if (!messageContent) {
        throw new Error("No suggestions received from AI");
      }

      try {
        const parsedContent = JSON.parse(messageContent);
        const items = parsedContent?.todos;

        if (!Array.isArray(items)) {
          throw new Error("Invalid response format from AI");
        }

        for (const item of items) {
          if (!item.taskName || typeof item.taskName !== "string") {
            throw new Error("Invalid task name in AI response");
          }

          const embedding = await getEmbeddingsWithAI(item.taskName);
          await ctx.runMutation(api.subTodos.createASubTodo, {
            taskName: item.taskName,
            description: item.description || "",
            priority: 1,
            dueDate: new Date().getTime(),
            projectId,
            parentId,
            labelId: AI_LABEL_ID as Id<"labels">,
            embedding,
          });
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown error parsing AI response";
        throw new Error(`Failed to process AI response: ${message}`);
      }
    } catch (error) {
      console.error("Error in suggestMissingSubItemsWithAi:", error);
      throw error;
    }
  },
});

export const getEmbeddingsWithAI = async (searchText: string) => {
  try {
    if (!apiKey) {
      throw new Error("OpenAI API Key is not defined");
    }

    const req = {
      input: searchText,
      model: "text-embedding-ada-002",
      encoding_format: "float",
    };

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `OpenAI API Error: ${errorData.error?.message || (await response.text())}`
      );
    }

    const json = await response.json();
    const vector = json["data"][0]["embedding"];

    console.log(
      `Generated embedding for "${searchText}": ${vector.length} dimensions`
    );
    return vector;
  } catch (error) {
    console.error("Error in getEmbeddingsWithAI:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to generate embeddings");
  }
};
