# Changelog for agiflow-sdk

## [0.0.24] - 2024-08-06

Update span attributes to support Otel GenAi convention

**Add attributes**
- `gen_ai.response.finish_reasons` 
- `gen_ai.system`
- `gen_ai.usage.search_units`

**Change attributes**
- `llm.type` to `gen_ai.operation.name`
- `llm.prompts` to span events with `gen_ai.content.prompt` name and `gen_ai.promp attributes`
- `llm.model` to `gen_ai.request.model` and `gen_ai.response.model`
- `llm.responses` to span events with `gen_ai.content.completion` name and `gen_ai.completion attributes`
- `llm.max_tokens` to `gen_ai.request.max_tokens`
- `llm.temperature` to `gen_ai.request.temperature`
- `llm.top_p` to `gen_ai.request.top_p`
- `llm.response_id` to `gen_ai.response.id`
- `llm.usage.tokens` to `gen_ai.usage.promp_tokens` and `gen_ai.usage.completion_tokens`

**Fix span name**
- Change Chat Completion span name to chat [MODEL_NAME]

[Merge PR #27](https://github.com/AgiFlow/agiflow-sdks/commit/f6973a21be28b1e943c687770461ee6359b60cca)

## [0.0.23] - 2024-07-22

**Added**
- Add `description` to span from CrewAI agent name.

**Fixed**
- Fix `langchain` chat `tool_calls` capture.
- Fix `openai` chat completion `tool_calls` capture.

## [0.0.22] - 2024-07-16

**Added**
- Add `langchain-core' llm stream instrumetation.

**Fixed**
- Fix `langchain-core` runnable input/output capture.

## [0.0.21] - 2024-07-13

**Added**
- Add pregel-invoke instrumentation.

**Fixed**
- Fix langgraph trace not instrumenting langchain-core.

## [0.0.20] - 2024-06-29

**Fixed**
- Fix class decorator missing `method_name` keyed argument.

## [0.0.19] - 2024-06-29

**Fixed**
- Fix github link to repo

## [0.0.18] - 2024-06-29

**Added**
- Add CrewAI support

## [0.0.1 - 0.0.17] - 2024-06-29

**Added**
- Ported from internal agiflow repo.


We look forward to your feedback and contributions to improve this library. Join our Discord community for support and discussions!
