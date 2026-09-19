import { EmbedBuilder, Colors } from "discord.js";

export const LogEvent = {
  VOICE_JOIN: "voice_join",
  VOICE_LEAVE: "voice_leave",
  VOICE_MOVE: "voice_move",
  SERVER_JOIN: "server_join",
  SERVER_LEAVE: "server_leave",
};

const EVENT_META = {
  [LogEvent.VOICE_JOIN]: { action: "เข้าช่องเสียง", color: Colors.Green },
  [LogEvent.VOICE_LEAVE]: { action: "ออกจากช่องเสียง", color: Colors.Red },
  [LogEvent.VOICE_MOVE]: { action: "ย้ายช่องเสียง", color: Colors.Blurple },
  [LogEvent.SERVER_JOIN]: { action: "เข้าร่วมเซิร์ฟเวอร์", color: Colors.Green },
  [LogEvent.SERVER_LEAVE]: { action: "ออกจากเซิร์ฟเวอร์", color: Colors.Red },
};

export function formatThaiDateTime(date) {
  return date.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "full",
    timeStyle: "medium",
  });
}

/**
 * Log สั้น ๆ บรรทัดเดียว: ชื่อ + action + ช่อง
 * วันที่/เวลาแสดงที่ footer ของ embed อัตโนมัติ
 *
 * @param {object} p
 * @param {string} p.event          LogEvent.*
 * @param {object} p.user           Discord user
 * @param {string} p.name           ชื่อที่แสดงด้านบน embed
 * @param {string} [p.channelName]  ชื่อช่องเสียง (join/leave)
 * @param {string} [p.fromName]     ช่องต้นทาง (move)
 * @param {string} [p.toName]       ช่องปลายทาง (move)
 * @param {string} [p.categoryName] หมวดหมู่ของช่องเสียง (footer)
 * @param {Date}   p.at
 */
export function buildLogEmbed({
  event,
  user,
  name,
  channelName,
  fromName,
  toName,
  categoryName,
  at,
}) {
  const meta = EVENT_META[event];

  let description = `<@${user.id}> ${meta.action}`;
  if (event === LogEvent.VOICE_MOVE) {
    description += ` ${code(fromName)} → ${code(toName)}`;
  } else if (channelName) {
    description += ` ${code(channelName)}`;
  }

  const embed = new EmbedBuilder()
    .setColor(meta.color)
    .setAuthor({ name, iconURL: avatarOf(user) })
    .setDescription(description)
    .setTimestamp(at);

  if (categoryName) embed.setFooter({ text: categoryName });

  return embed;
}

function code(name) {
  return `\`${name ?? "ไม่ทราบช่อง"}\``;
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
