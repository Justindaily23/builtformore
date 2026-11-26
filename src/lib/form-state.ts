export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Increases after each successful save, so a form can refresh itself. */
  saved: number;
};

export const emptyState: FormState = { saved: 0 };
