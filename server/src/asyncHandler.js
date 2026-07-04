// Express 4 doesn't catch rejected promises from async route handlers —
// without this, a thrown error inside `await`ed code just hangs the request.
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
