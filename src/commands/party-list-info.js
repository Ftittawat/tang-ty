import { SlashCommandBuilder, EmbedBuilder, Colors } from "discord.js";
import { getAllParties, getParty, PartyStatus } from "../models/party.js";
import { buildPartyEmbed } from "../utils/embeds.js";
import { buildPartyComponents } from "../utils/components.js";

// /party-list
export const listData = new SlashCommandBuilder()
  .setName("tangty-list")
  .setDescription("ดูรายการปาร์ตี้ที่เปิดอยู่ในเซิร์ฟเวอร์");

export async function listExecute(interaction) {
  const active = getAllParties().filter(
    (p) =>
      p.guildId === interaction.guildId &&
      [PartyStatus.OPEN, PartyStatus.FULL, PartyStatus.CLOSED].includes(p.status)
  );

  if (active.length === 0) {
    await interaction.reply({
      content: "📭 ยังไม่มีปาร์ตี้ที่เปิดอยู่ในเซิร์ฟเวอร์นี้",
      ephemeral: true,
    });
    return;
  }

  const STATUS_EMOJI = {
    [PartyStatus.OPEN]: "🟢",
    [PartyStatus.FULL]: "🔴",
    [PartyStatus.CLOSED]: "🔒",
  };

  const lines = active.map((p) => {
    const ts = Math.floor(new Date(p.deadline).getTime() / 1000);
    const emoji = STATUS_EMOJI[p.status] ?? "❓";
    return `${emoji} **${p.activity}** — ${p.members.length}/${p.maxMembers} คน | ปิดรับ <t:${ts}:R> | ID: \`${p.id}\``;
  });

  const embed = new EmbedBuilder()
    .setTitle("📋 รายการปาร์ตี้ที่เปิดอยู่")
    .setDescription(lines.join("\n"))
    .setColor(Colors.Blurple);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// /party-info
export const infoData = new SlashCommandBuilder()
  .setName("tangty-info")
  .setDescription("ดูรายละเอียดปาร์ตี้ด้วย Party ID")
  .addStringOption((opt) =>
    opt.setName("party_id").setDescription("ID ของปาร์ตี้").setRequired(true)
  );

export async function infoExecute(interaction) {
  const partyId = interaction.options.getString("party_id").trim();
  const party = getParty(partyId);

  if (!party) {
    await interaction.reply({ content: "❌ ไม่พบปาร์ตี้นี้", ephemeral: true });
    return;
  }

  const embed = buildPartyEmbed(party);
  const components = party.status !== PartyStatus.CANCELLED ? buildPartyComponents(party) : [];
  await interaction.reply({ embeds: [embed], components, ephemeral: true });
}
