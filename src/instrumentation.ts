export async function register() {
  // Native instrumentation hook (Sentry descoped per DCR-016)
}

export const onRequestError = (error: unknown) => {
  console.error("[NextRequestError]", error);
};
