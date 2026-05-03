import { EmbedBuilder, Colors } from "discord.js";
import { PartyStatus } from "../models/party.js";

const STATUS_EMOJI = {
  [PartyStatus.OPEN]: "🟢",
  [PartyStatus.FULL]: "🔴",
  [PartyStatus.CLOSED]: "🔒",
  [PartyStatus.CANCELLED]: "❌",
};

const STATUS_LABEL = {
  [PartyStatus.OPEN]: "รับสมาชิกอยู่",
  [PartyStatus.FULL]: "เต็มแล้ว",
  [PartyStatus.CLOSED]: "ปิดรับสมาชิก",
  [PartyStatus.CANCELLED]: "ยกเลิกแล้ว",
};

const COLOR_MAP = {
  [PartyStatus.OPEN]: Colors.Green,
  [PartyStatus.FULL]: Colors.Orange,
  [PartyStatus.CLOSED]: Colors.Blurple,
  [PartyStatus.CANCELLED]: Colors.Red,
};

export function buildPartyEmbed(party) {
  const emoji = STATUS_EMOJI[party.status] ?? "❓";
  const label = STATUS_LABEL[party.status] ?? party.status;
  const color = COLOR_MAP[party.status] ?? Colors.Default;

  const deadlineTs = Math.floor(new Date(party.deadline).getTime() / 1000);
  const date = new Date(deadlineTs * 1000)
  const thaiDate = date.toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "full",
    timeStyle: "short"
  });

  const membersText =
    party.members.length === 0
      ? "_ยังไม่มีสมาชิก_"
      : party.members
          .map((m, i) => {
            const classLabel = m.class ? ` [${m.class}]` : "";
            return `${i + 1}. <@${m.id}>${classLabel}`;
          })
          .join("\n");

  return new EmbedBuilder()
    .setTitle(`🎯 ${party.activity}`)
    .setColor(color)
    .addFields(
      { name: "สถานะ", value: `${emoji} ${label}`, inline: true },
      { name: "สมาชิก", value: `👥 ${party.members.length} / ${party.maxMembers}`, inline: true },
      { name: "หัวหน้าปาร์ตี้", value: `👑 ${party.leaderName}`, inline: true },
      //{ name: "⏰ ปิดรับสมาชิก", value: `<t:${deadlineTs}:F> (<t:${deadlineTs}:R>)`, inline: false },
      { name: "วันเวลาเริ่ม", value: `${thaiDate} (<t:${deadlineTs}:R>)`, inline: false },
      {
        name: `รายชื่อสมาชิก (${party.members.length}/${party.maxMembers})`,
        value: membersText,
        inline: false,
      }
    )
    .setFooter({ text: `Party ID: ${party.id}` });
}
