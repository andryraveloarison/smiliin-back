// src/lib/events.ts
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";


export type EventType = "international" | "madagascar";
export type EventOccurrence = {
  key: string;
  name: string;
  date: string;   // "YYYY-MM-DD"
  type: EventType;
  tags?: string[];
};

// ───────── Résolution robuste du chemin Excel ─────────
function safeDirname(): string {
  // En CommonJS, __dirname existe; en ESM, non → on retombe sur process.cwd().
  // (NestJS par défaut est CommonJS, donc __dirname marche en prod/dist.)
  try {
    // @ts-ignore
    if (typeof __dirname !== "undefined") return __dirname as string;
  } catch {}
  return process.cwd();
}

function resolveExcelPath(): string {
  const fromCwd = process.cwd();

  const candidates = [
    process.env.EVENTS_XLSX,                             // 1) défini via env
    path.resolve(fromCwd, "src/data/data_event.xlsx"),   // 2) fichier dans src/data
    path.resolve(fromCwd, "data/data_event.xlsx"),       // 3) fichier dans un dossier data à la racine
    path.resolve(fromCwd, "data_event.xlsx"),            // 4) fichier direct à la racine
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  throw new Error(
    `[events] Fichier introuvable: vérifie ./src/data/data_event.xlsx ou définis EVENTS_XLSX`
  );
}


const EXCEL_PATH = resolveExcelPath();
let DID_LOG_PATH = false;

const SHEET_INDEX = 0;
const HEADERS = { name: "Nom", date: "Date", type: "Type", tags: "Tags" };

// ───────── Utils ─────────
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toIsoDate(d: Date): string {
  const safe = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0));
  return safe.toISOString().slice(0, 10);
}

function isValidISO(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

function excelCellToISO(v: any): string | null {
  if (v == null || v === "") return null;

  if (typeof v === "string" && isValidISO(v.trim())) return v.trim();

  if (typeof v === "string") {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return toIsoDate(d);
  }

  if (v instanceof Date) {
    if (!isNaN(v.getTime())) return toIsoDate(v);
  }

  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) {
      const asDate = new Date(Date.UTC(d.y, (d.m ?? 1) - 1, d.d ?? 1, 12, 0, 0));
      return toIsoDate(asDate);
    }
  }

  return null;
}

function mapType(raw: any): EventType {
  const s = String(raw || "").trim().toLowerCase();
  return s === "madagascar" ? "madagascar" : "international";
}

function parseTags(raw: any): string[] | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
  return String(raw).split("|").map((x) => x.trim()).filter(Boolean);
}

// ───────── Cache lecture ─────────
let CACHE: { mtimeMs: number; events: EventOccurrence[] } | null = null;

function loadAllEventsFromExcel(): EventOccurrence[] {
  // log une seule fois le chemin choisi
  if (!DID_LOG_PATH) {
    console.log(`[events] Excel path = ${EXCEL_PATH}`);
    DID_LOG_PATH = true;
  }

  let stat: fs.Stats;
  try {
    stat = fs.statSync(EXCEL_PATH);
  } catch (e: any) {
    throw new Error(
      `[events] Fichier introuvable: ${EXCEL_PATH}\n` +
      `Astuce: place "data_event.xlsx" à la racine du projet dans ./data/ ou définis EVENTS_XLSX=/chemin/vers/data_event.xlsx`
    );
  }

  if (CACHE && CACHE.mtimeMs === stat.mtimeMs) return CACHE.events;

  const wb = XLSX.readFile(EXCEL_PATH, { cellDates: true, cellNF: false, cellText: false });
  const sheetName = wb.SheetNames[SHEET_INDEX];
  if (!sheetName) throw new Error("[events] Aucune feuille trouvée dans data_event.xlsx");
  const ws = wb.Sheets[sheetName];

  const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
  const out: EventOccurrence[] = [];

  for (const r of rows) {
    const nameRaw = r[HEADERS.name];
    const dateRaw = r[HEADERS.date];
    const typeRaw = r[HEADERS.type];
    const tagsRaw = r[HEADERS.tags];

    const name = String(nameRaw || "").trim();
    const iso = excelCellToISO(dateRaw);
    if (!name || !iso) continue;

    const type = mapType(typeRaw);
    const tags = parseTags(tagsRaw);
    const key = `${slugify(name)}-${iso}`;

    out.push({ key, name, date: iso, type, tags });
  }

  out.sort((a, b) => (a.date === b.date ? a.name.localeCompare(b.name) : a.date.localeCompare(b.date)));

  CACHE = { mtimeMs: stat.mtimeMs, events: out };
  return out;
}

// ───────── API publique ─────────
export function buildOccurrencesForYear(year: number): EventOccurrence[] {
  return loadAllEventsFromExcel().filter((e) => Number(e.date.slice(0, 4)) === year);
}

export function buildRollingOccurrences(baseYear: number): EventOccurrence[] {
  const all = loadAllEventsFromExcel();
  return all.filter((e) => {
    const y = Number(e.date.slice(0, 4));
    return y === baseYear || y === baseYear + 1;
  });
}

export function getUpcomingEvents(windowDays = 14, now = new Date()): EventOccurrence[] {
  const all = loadAllEventsFromExcel();

  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const end = new Date(start.getTime());
  end.setUTCDate(end.getUTCDate() + windowDays);

  const startTs = start.getTime();
  const endTs = end.getTime();

  const res = all.filter((ev) => {
    const t = new Date(ev.date + "T00:00:00Z").getTime();
    return t >= startTs && t <= endTs;
  });

  return res.sort((a, b) => (a.date === b.date ? a.name.localeCompare(b.name) : a.date.localeCompare(b.date)));
}

export function pickRandomThemeOrNull<T extends EventOccurrence | null>(
  events: EventOccurrence[],
  nullProbability = 0.33
): T {
  if (!events.length) return null as T;
  if (Math.random() < nullProbability) return null as T;
  const idx = Math.floor(Math.random() * events.length);
  return events[idx] as T;
}
