name: webdev-llm-integration
description: Manus webdev fullstack (web-db-user) & mobile-app (Expo) projects — built-in LLM integration for AI features, chat completions, structured JSON responses, model listing/selection, streaming, thinking/reasoning.




LLM Integration

Use the preconfigured LLM helpers. Credentials are injected from the platform (no manual setup required).

import { invokeLLM } from "./server/_core/llm";

/**
 * Simple chat completion
 * type Role = "system" | "user" | "assistant" | "tool" | "function";
 * type TextContent = {
 *   type: "text";
 *   text: string;
 * };
 *
 * type ImageContent = {
 *   type: "image_url";
 *   image_url: {
 *     url: string;
 *     detail?: "auto" | "low" | "high";
 *   };
 * };
 *
 * type FileContent = {
 *   type: "file_url";
 *   file_url: {
 *     url: string;
 *     mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
 *   };
 * };
 *
 * export type Message = {
 *   role: Role;
 *   content: string | Array<ImageContent | TextContent | FileContent>
 * };
 *
 * Supported parameters:
 * messages: Array<{
 *   role: 'system' | 'user' | 'assistant' | 'tool',
 *   content: string | { tool_call: { name: string, arguments: string } }
 * }>
 * tool_choice?: 'none' | 'auto' | 'required' | { type: 'function', function: { name: string } }
 * tools?: Tool[]
 */
const response = await invokeLLM({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello, world!" },
  ],
});
