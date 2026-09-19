import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";

const CONFIG_FILE = process.env.LOG_CONFIG_FILE ?? "/data/log-config.json";

function loadAll() {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveAll(data) {
  mkdirSync(dirname(CONFIG_FILE), { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Config ของ server เดียว (null = ยังไม่ได้ตั้งค่า)
 * รูปแบบ: { channelId, updatedBy, updatedAt }
 */
export function getLogConfig(guildId) {
  if (!guildId) return null;
  return loadAll()[guildId] ?? null;
}

export function setLogChannel(guildId, channelId, updatedBy) {
  const data = loadAll();
  data[guildId] = {
    channelId,
    updatedBy: updatedBy ?? null,
    updatedAt: new Date().toISOString(),
  };
  saveAll(data);
  return data[guildId];
}

export function clearLogChannel(guildId) {
  const data = loadAll();
  if (!data[guildId]) return false;
  delete data[guildId];
  saveAll(data);
  return true;
}
