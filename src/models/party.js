import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { randomBytes } from "crypto";

const DATA_FILE = process.env.DATA_FILE ?? "/data/parties.json";

export const PartyStatus = {
  OPEN: "open",
  FULL: "full",
  CLOSED: "closed",
  CANCELLED: "cancelled",
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

export function createParty({ activity, leaderId, leaderName, maxMembers, deadline, type = "regular", leaderClass = null }) {
  const id = randomBytes(4).toString("hex");
  const party = {
    id,
    activity,
    leaderId,
    leaderName,
    maxMembers,
    deadline: deadline.toISOString(),
    status: PartyStatus.OPEN,
    type,
    members: [],
    messageId: null,
    channelId: null,
    guildId: null,
    createdAt: new Date().toISOString(),
  };

  // Auto-add leader as first member
  party.members.push({ id: leaderId, name: leaderName, class: leaderClass });

  const data = loadAll();
  data[id] = party;
  saveAll(data);
  return party;
}

export function getParty(partyId) {
  return loadAll()[partyId] ?? null;
}

export function saveParty(party) {
  const data = loadAll();
  data[party.id] = party;
  saveAll(data);
}

export function getAllParties() {
  return Object.values(loadAll());
}

// --- Helper functions on party object ---

export function isMember(party, userId) {
  return party.members.some((m) => m.id === userId);
}

export function isLeader(party, userId) {
  return party.leaderId === userId;
}

export function addMember(party, userId, userName, memberClass = null) {
  if (isMember(party, userId)) return false;
  if (party.members.length >= party.maxMembers) return false;
  party.members.push({ id: userId, name: userName, class: memberClass });
  if (party.members.length >= party.maxMembers) party.status = PartyStatus.FULL;
  return true;
}

export function removeMember(party, userId) {
  const before = party.members.length;
  party.members = party.members.filter((m) => m.id !== userId);
  if (party.members.length < before && party.status === PartyStatus.FULL) {
    party.status = PartyStatus.OPEN;
  }
  return party.members.length < before;
}
