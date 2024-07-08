# AGIFlow JavaScript SDK Documentation

## Getting Started

To get started with [AGIFlow JavaScript SDK](https://docs.agiflow.io/web), simply add the package using pnpm:

```bash
pnpm add @agiflowai/js-sdk
```

## SDK Overview

The `@agiflowai/js-sdk` provides the following functionalities:
- Establish user sessions to keep client tracking private to the user.
- Keep track of user interactions and tracing.
- Manage feedback widgets and prompts.

## Setup SDK

To set up the `@agiflowai/js-sdk` client, initialize it once and use `agiflowClient` throughout your application as shown below:

```javascript
import { Agiflow } from '@agiflowai/js-sdk';

const agiflowClient = new Agiflow();
agiflowClient.init(
  process.env.CLIENT_KEY // Agiflow client key (please don't use API key here)
);
```

You can find the client key on the Environment > Settings page of the AGIFlow Dashboard.

## Tracing

AGIFlow JavaScript SDK supports both manual and automatic tracing. Automatic tracing is great to get started, but if you need fine-grained control of tracking tags and grouping, manual tracing is a better option.

### Automatic Tracing

To enable automatic tracing, add an additional setting when initializing the SDK as shown below:

```javascript
agiflowClient.init('<CLIENT_KEY>', {
  autoTrace: true,
});
```

When `autoTrace` is enabled, global fetch requests will be wrapped, and `x-agiflow-trace-id` and `x-agiflow-auto-trace` headers will be sent to the backend.

### Manual Tracing

Similar to other analytics tools, AGIFlow provides a `track` method to collect useful user metrics on the frontend. This approach allows you to associate frontend metrics with backend traces by passing specific headers to backend APIs. Here are different ways to use manual tracing:

#### Async Tracking

To automatically capture DOM mutations and display them to users when collecting feedback, wrap your tracking within the `trackAsync` method as shown below:

```javascript
const res = await agiflowClient.trackAsync(
  'summary', // A defined task name
  async (actionId, headers) => {
    return await fetch(`...`, {
      headers,
    });
  }
);
```

**Explanation of `trackAsync` function:**
- The first argument is the label of a task.
- The callback function generates a unique action ID and headers with `x-agiflow-trace-id`, which are passed to the backend for end-to-end tracing (the action ID can be used to collect inline user feedback).

#### Synchronous Tracking

If you don't want to wrap your API call in a callback or if your DOM mutation happens sometime after the API returns, use the `track` method and manually call `completeAction` to capture the DOM mutation.

```javascript
const { headers, actionId } = agiflowClient.track('summary');
await fetch(`...`, {
  headers,
});
agiflowClient.completeAction(actionId);
```

**Explanation of `track` function:**
- The first argument is the label of a task.
- The `track` function returns an action ID and headers with `x-agiflow-trace-id`, which are passed to the backend for end-to-end tracing (the action ID can be used to collect inline user feedback).
- To capture a DOM mutation, call `completeAction` with the action ID.

#### Complete a Task

You can explicitly mark a task as completed by the user by calling the `completeTask` method. This helps in understanding how users interact with AI products or provides more context for feedback later on.

```javascript
agiflowClient.completeTask(
  'summary', // A defined task name
);
```

With `autoTrace` enabled, a task will automatically be marked as completed.

## Feedback

With every trace, AGIFlow keeps a snapshot of user interactions on the client side, allowing users to rewind and get more context when providing feedback.

### Collecting User Feedback

Here’s how you can collect user feedback on the client side with the AGIFlow SDK:

#### Inline Feedback

You can use the action ID generated with `track` or `trackAsync` to identify user feedback such as thumbs up/thumbs down directly on the client:

```javascript
agiflowClient.reportScore(
  actionId, // Action ID generated from track
  0.6 // Normalized score
);
```

**Normalized Score Conversion Reference:**
- Thumbs up = 1
- Thumbs down = 0
- Rank 0 -> 10 is converted to [0, 1].

#### Feedback Widget

The feedback widget is a powerful tool to provide feedback on AI output and increase the transparency of your AI application. There are two modes to display the feedback widget:

##### Simple Chat Feedback

```javascript
const agiflowClient = new Agiflow();
agiflowClient.init(
  process.env.CLIENT_KEY, // Agiflow client key (please don't use API key here)
  { feedbackPreviews: ['screen'] }
);
agiflowClient.openWidget();
```

When users agree to provide feedback, this will replay the screen state when the AI interaction happened.

##### Complex Workflow Feedback

```javascript
const agiflowClient = new Agiflow();
agiflowClient.init(
  process.env.CLIENT_KEY, // Agiflow client key (please don't use API key here)
  { feedbackPreviews: ['workflow'] }
);
agiflowClient.openWidget();
```

This mode displays a workflow chart where users can click on specific components of the AI workflow to review output and provide feedback. This is especially useful for internal tools or B2B businesses.

### Subscribe to Issues Detected by Guardrails

If you wish to only open the feedback widget when there are issues with the LLM, you can subscribe to new issues and decide to call `openWidget` at any time as shown below:

```javascript
agiflowClient.subscribeToNewIssue((issue) => {
  ...
});
```

By following [this documentation](https://docs.agiflow.io/web), you can effectively utilize the AGIFlow JavaScript SDK to track user interactions, collect feedback, and ensure better transparency and control over your AI applications.
