import { PermissionFlagsBits } from "discord.js";
import { getLogConfig } from "../models/log-config.js";

const REQUIRED_PERMS = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.EmbedLinks,
];

/**
 * หา text channel สำหรับ log ของเซิร์ฟเวอร์นี้
 * คืน null ถ้ายังไม่ได้ตั้งค่า / ห้องถูกลบ / บอทไม่มีสิทธิ์
 *
 * สำคัญ: ดึงห้องจาก guild.channels เท่านั้น (ไม่ใช่ client.channels)
 * และตรวจ guildId ซ้ำอีกชั้น เพื่อไม่ให้ log ของเซิร์ฟเวอร์หนึ่ง
 * ไปโผล่ที่อีกเซิร์ฟเวอร์หนึ่ง
 */
export async function resolveLogChannel(guild) {
  if (!guild) return null;

  const config = getLogConfig(guild.id);
  if (!config?.channelId) return null;

  let channel;
  try {
    channel = await guild.channels.fetch(config.channelId);
  } catch {
    return null;
  }

  if (!channel) return null;
  if (channel.guildId !== guild.id) return null;
  if (!channel.isTextBased()) return null;

  const me = guild.members.me ?? (await guild.members.fetchMe().catch(() => null));
  if (!me) return null;
  if (!channel.permissionsFor(me)?.has(REQUIRED_PERMS)) return null;

  return channel;
}

/**
 * ส่ง log embed ไปยังห้องที่ตั้งค่าไว้ของเซิร์ฟเวอร์นั้น ๆ
 */
export async function sendGuildLog(guild, embed) {
  try {
    const channel = await resolveLogChannel(guild);
    if (!channel) return false;

    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
    return true;
  } catch (err) {
    console.warn(`⚠️ ส่ง server log ไม่สำเร็จ (guild=${guild?.id}): ${err.message}`);
    return false;
  }
}
