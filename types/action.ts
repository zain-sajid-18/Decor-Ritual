/**
 * Standard Server Action result shape.
 * Returned by mutation actions to communicate validation errors,
 * operation success, or user-facing failure messages.
 */
export interface ActionState {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export const INITIAL_ACTION_STATE: ActionState = {
  success: false,
};
