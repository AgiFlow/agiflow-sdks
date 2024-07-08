interface TracePayload {
  id: string;
  taskId?: string;
  taskName?: string;
  taskStartedAt?: Date;
  sessionId?: string;
}

export const encodeTracePayload = (payload: TracePayload) => {
  return btoa(
    JSON.stringify({
      id: payload.id,
      taskId: payload.taskId,
      taskName: payload.taskName,
      taskStartedAt: payload.taskStartedAt,
      sessionId: payload.sessionId,
    }),
  );
};
