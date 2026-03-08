export function toolResult(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export function toolError(message) {
  return {
    content: [{ type: "text", text: JSON.stringify({ error: message }) }],
    isError: true,
  };
}

export function wrapHandler(fn) {
  return async (args) => {
    try {
      return await fn(args);
    } catch (err) {
      return toolError(err?.message || String(err));
    }
  };
}
