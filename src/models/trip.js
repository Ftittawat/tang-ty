import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { randomBytes } from "crypto";

const DATA_FILE = process.env.TRIP_FILE ?? "/data/trips.json";

export const TripStatus = {
  WANT: "want", // ยังอยากไป
  VISITED: "visited", // ไปมาแล้ว
};

function loadAll() {
  if (!existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveAll(data) {
  mkdirSync(dirname(DATA_FILE), { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function createTrip({ place, note = null, guildId, creatorId, creatorName }) {
  const id = randomBytes(4).toString("hex");
  const trip = {
    id,
    place,
    note,
    guildId,
    creatorId,
    creatorName,
    status: TripStatus.WANT,
    wantList: [],
    messageId: null,
    channelId: null,
    createdAt: new Date().toISOString(),
    visitedAt: null,
  };

  const data = loadAll();
  data[id] = trip;
  saveAll(data);
  return trip;
}

export function getTrip(tripId) {
  return loadAll()[tripId] ?? null;
}

export function saveTrip(trip) {
  const data = loadAll();
  data[trip.id] = trip;
  saveAll(data);
}

export function deleteTrip(tripId) {
  const data = loadAll();
  if (!data[tripId]) return false;
  delete data[tripId];
  saveAll(data);
  return true;
}

/** รายการของเซิร์ฟเวอร์นี้เท่านั้น (ใหม่สุดก่อน) */
export function getGuildTrips(guildId) {
  return Object.values(loadAll())
    .filter((t) => t.guildId === guildId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// --- Helper functions on trip object ---

export function wantsToGo(trip, userId) {
  return trip.wantList.some((u) => u.id === userId);
}

/** กดซ้ำ = ยกเลิก | คืน "added" หรือ "removed" */
export function toggleWant(trip, userId, userName) {
  if (wantsToGo(trip, userId)) {
    trip.wantList = trip.wantList.filter((u) => u.id !== userId);
    return "removed";
  }
  trip.wantList.push({ id: userId, name: userName });
  return "added";
}

export function setVisited(trip, visited) {
  trip.status = visited ? TripStatus.VISITED : TripStatus.WANT;
  trip.visitedAt = visited ? new Date().toISOString() : null;
}
