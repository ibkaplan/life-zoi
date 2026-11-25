import type { SupabaseClient } from "@supabase/supabase-js";
import { GLUCOSE_CONTEXTS, NOTE_MAX, type GlucoseContext, type GlucoseUnit, type HealthReading, type NewReading } from "./types";
import { LIMITS } from "./validate";

/**
 * Reads and writes the person's own rows in `health_readings`
 * (supabase/migrations/20261125000000_health_readings.sql). Row level security
 * limits every call to rows whose user_id is the signed-in person. Readings are
 * never written to localStorage, never sent to an AI, and never sent to any
 * other service.
 */
export const HEALTH_TABLE = "health_readings";
/** The most readings the diary loads at once (several readings a day for years). */
export const LOAD_LIMIT = 5000;

const COLUMNS =
  "id, kind, measured_at, systolic, diastolic, pulse, glucose_mgdl, glucose_context, total_mgdl, ldl_mgdl, hdl_mgdl, triglycerides_mgdl, unit, note";

export type HealthRow = {
  id: string;
  user_id?: string;
  kind: string;
  measured_at: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  glucose_mgdl: number | string | null;
  glucose_context: string | null;
  total_mgdl: number | string | null;
  ldl_mgdl: number | string | null;
  hdl_mgdl: number | string | null;
  triglycerides_mgdl: number | string | null;
  unit: string | null;
  note: string | null;
};

/** Postgres numeric arrives as text; a value outside the accepted limits is dropped. */
function num(value: unknown, field: keyof typeof LIMITS): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;
  const { min, max } = LIMITS[field];
  return parsed >= min && parsed <= max ? parsed : null;
}

function unitOf(value: unknown): GlucoseUnit {
  return value === "mmol/L" ? "mmol/L" : "mg/dL";
}

/** A database row as a diary reading, or null when the row is not one the diary understands. */
export function rowToReading(row: HealthRow): HealthReading | null {
  if (typeof row.id !== "string" || typeof row.measured_at !== "string" || Number.isNaN(Date.parse(row.measured_at))) return null;
  const measuredAt = new Date(row.measured_at).toISOString();
  const note = typeof row.note === "string" ? row.note.slice(0, NOTE_MAX) : "";
  if (row.kind === "blood_pressure") {
    const systolic = num(row.systolic, "systolic");
    const diastolic = num(row.diastolic, "diastolic");
    if (systolic === null || diastolic === null) return null;
    return { id: row.id, kind: "blood_pressure", measuredAt, systolic, diastolic, pulse: num(row.pulse, "pulse"), note };
  }
  if (row.kind === "glucose") {
    const glucose = num(row.glucose_mgdl, "glucose");
    const context = GLUCOSE_CONTEXTS.includes(row.glucose_context as GlucoseContext) ? (row.glucose_context as GlucoseContext) : "other";
    if (glucose === null) return null;
    return { id: row.id, kind: "glucose", measuredAt, glucose, context, unit: unitOf(row.unit), note };
  }
  if (row.kind === "cholesterol") {
    const reading = {
      id: row.id,
      kind: "cholesterol" as const,
      measuredAt,
      total: num(row.total_mgdl, "total"),
      ldl: num(row.ldl_mgdl, "ldl"),
      hdl: num(row.hdl_mgdl, "hdl"),
      triglycerides: num(row.triglycerides_mgdl, "triglycerides"),
      unit: unitOf(row.unit),
      note,
    };
    if ([reading.total, reading.ldl, reading.hdl, reading.triglycerides].every((value) => value === null)) return null;
    return reading;
  }
  return null;
}

/** A new reading as the row to insert. Columns that do not belong to its kind are null (the table checks this). */
export function readingToRow(reading: NewReading, userId: string): Omit<HealthRow, "id"> & { user_id: string } {
  const base = {
    user_id: userId,
    kind: reading.kind,
    measured_at: reading.measuredAt,
    systolic: null,
    diastolic: null,
    pulse: null,
    glucose_mgdl: null,
    glucose_context: null,
    total_mgdl: null,
    ldl_mgdl: null,
    hdl_mgdl: null,
    triglycerides_mgdl: null,
    unit: null,
    note: reading.note.trim().slice(0, NOTE_MAX) || null,
  };
  if (reading.kind === "blood_pressure") return { ...base, systolic: reading.systolic, diastolic: reading.diastolic, pulse: reading.pulse };
  if (reading.kind === "glucose") return { ...base, glucose_mgdl: reading.glucose, glucose_context: reading.context, unit: reading.unit };
  return {
    ...base,
    total_mgdl: reading.total,
    ldl_mgdl: reading.ldl,
    hdl_mgdl: reading.hdl,
    triglycerides_mgdl: reading.triglycerides,
    unit: reading.unit,
  };
}

export type RepoResult<T> = { ok: true; value: T } | { ok: false; missingTable: boolean };

/** PostgREST reports a table that does not exist yet as 42P01 or PGRST205. */
function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42P01" || error.code === "PGRST205" || /does not exist|could not find the table/i.test(error.message ?? "");
}

export async function loadReadings(client: SupabaseClient, userId: string): Promise<RepoResult<HealthReading[]>> {
  const { data, error } = await client
    .from(HEALTH_TABLE)
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("measured_at", { ascending: false })
    .limit(LOAD_LIMIT);
  if (error) return { ok: false, missingTable: isMissingTable(error) };
  const readings = ((data ?? []) as HealthRow[]).map(rowToReading).filter((reading): reading is HealthReading => reading !== null);
  return { ok: true, value: readings };
}

export async function insertReading(client: SupabaseClient, userId: string, reading: NewReading): Promise<RepoResult<HealthReading>> {
  const { data, error } = await client.from(HEALTH_TABLE).insert(readingToRow(reading, userId)).select(COLUMNS).single();
  if (error || !data) return { ok: false, missingTable: isMissingTable(error) };
  const saved = rowToReading(data as HealthRow);
  return saved ? { ok: true, value: saved } : { ok: false, missingTable: false };
}

export async function removeReading(client: SupabaseClient, userId: string, id: string): Promise<boolean> {
  const { error } = await client.from(HEALTH_TABLE).delete().eq("user_id", userId).eq("id", id);
  return !error;
}

export async function removeAllReadings(client: SupabaseClient, userId: string): Promise<boolean> {
  const { error } = await client.from(HEALTH_TABLE).delete().eq("user_id", userId);
  return !error || isMissingTable(error);
}
