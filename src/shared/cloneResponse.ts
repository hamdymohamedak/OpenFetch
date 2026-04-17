/**
 * Clone a `fetch` {@link Response} so the body can be read more than once.
 * Each clone still allows only one consumption of that clone’s body; use multiple clones as needed.
 */
export function cloneResponse(res: Response): Response {
  return res.clone();
}
