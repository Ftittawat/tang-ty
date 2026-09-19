import { EmbedBuilder, Colors } from "discord.js";

export const LogEvent = {
  VOICE_JOIN: "voice_join",
  VOICE_LEAVE: "voice_leave",
  VOICE_MOVE: "voice_move",
  SERVER_JOIN: "server_join",
  SERVER_LEAVE: "server_leave",
};

const EVENT_META = {
  [LogEvent.VOICE_JOIN]: { emoji: "🔊", title: "เข้าห้องเสียง", color: Colors.Green },
  [LogEvent.VOICE_LEAVE]: { emoji: "🔈", title: "ออกจากห้องเสียง", color: Colors.Orange },
  [LogEvent.VOICE_MOVE]: { emoji: "🔁", title: "ย้ายห้องเสียง", color: Colors.Blurple },
  [LogEvent.SERVER_JOIN]: { emoji: "📥", title: "เข้าร่วมเซิร์ฟเวอร์", color: Colors.Green },
  [LogEvent.SERVER_LEAVE]: { emoji: "📤", title: "ออกจากเซิร์ฟเวอร์", color: Colors.Red },
};

export function formatThaiDateTime(date) {
  return date.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "full",
    timeStyle: "medium",
  });
}

function dateTimeField(at) {
  const ts = Math.floor(at.getTime() / 1000);
  return {
    name: "🕒 วันที่และเวลา",
    value: `${formatThaiDateTime(at)} (<t:${ts}:R>)`,
    inline: false,
  };
}

/**
 * Log การเข้า/ออก/ย้ายห้องเสียง
 * @param {object} p
 * @param {string} p.event         LogEvent.VOICE_*
 * @param {object} p.user          Discord user
 * @param {string} p.displayName   ชื่อที่แสดงในเซิร์ฟเวอร์
 * @param {string} [p.channelName] ชื่อห้องเสียง (join/leave)
 * @param {string} [p.channelId]
 * @param {string} [p.fromName]    ห้องต้นทาง (move)
 * @param {string} [p.fromId]
 * @param {string} [p.toName]      ห้องปลายทาง (move)
 * @param {string} [p.toId]
 * @param {Date}   p.at
 */
export function buildVoiceLogEmbed({
  event,
  user,
  displayName,
  channelName,
  channelId,
  fromName,
  fromId,
  toName,
  toId,
  at,
}) {
  const meta = EVENT_META[event];
  const fields = [
    {
      name: "👤 ผู้ใช้",
      value: `<@${user.id}>\n\`${displayName}\` (${user.tag})`,
      inline: false,
    },
  ];

  if (event === LogEvent.VOICE_MOVE) {
    fields.push(
      { name: "🔉 จากห้อง", value: channelLine(fromName, fromId), inline: true },
      { name: "🔊 ไปห้อง", value: channelLine(toName, toId), inline: true }
    );
  } else {
    fields.push({
      name: "🔊 ห้องเสียง",
      value: channelLine(channelName, channelId),
      inline: false,
    });
  }

  fields.push(dateTimeField(at));

  return new EmbedBuilder()
    .setColor(meta.color)
    .setAuthor({ name: `${meta.emoji} ${meta.title}`, iconURL: avatarOf(user) })
    .addFields(fields)
    .setFooter({ text: `User ID: ${user.id}` })
    .setTimestamp(at);
}

/**
 * Log การเข้า/ออกจากเซิร์ฟเวอร์
 */
export function buildMemberLogEmbed({ event, user, displayName, at, memberCount }) {
  const meta = EVENT_META[event];
  const fields = [
    {
      name: "👤 ผู้ใช้",
      value: `<@${user.id}>\n\`${displayName}\` (${user.tag})`,
      inline: false,
    },
    dateTimeField(at),
  ];

  if (typeof memberCount === "number") {
    fields.push({ name: "👥 สมาชิกทั้งหมด", value: `${memberCount} คน`, inline: true });
  }

  return new EmbedBuilder()
    .setColor(meta.color)
    .setAuthor({ name: `${meta.emoji} ${meta.title}`, iconURL: avatarOf(user) })
    .addFields(fields)
    .setFooter({ text: `User ID: ${user.id}` })
    .setTimestamp(at);
}

// กัน embed พังถ้า user object ไม่สมบูรณ์ (partial) — iconURL ต้องเป็น URL ที่ถูกต้องเท่านั้น
function avatarOf(user) {
  try {
    const url = user.displayAvatarURL?.();
    return typeof url === "string" && /^https?:\/\//.test(url) ? url : undefined;
  } catch {
    return undefined;
  }
}

function channelLine(name, id) {
  if (!name && !id) return "_ไม่ทราบห้อง_";
  if (!id) return `\`${name}\``;
  return `<#${id}>\n\`${name ?? id}\``;
}
