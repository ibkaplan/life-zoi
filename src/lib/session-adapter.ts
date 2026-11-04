/** This build includes the Supabase session adapter. */
export const SESSION_ADAPTER = "supabase" as const;

export type SessionAdapterKind = typeof SESSION_ADAPTER | "absent";
