import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { PartyStatus } from "../models/party.js";

export function buildPartyComponents(party) {
  const isActive = [PartyStatus.OPEN, PartyStatus.FULL].includes(party.status);
  const isOpen = party.status === PartyStatus.OPEN;
  const isClosed = party.status === PartyStatus.CLOSED;
  const isCancelled = party.status === PartyStatus.CANCELLED;

  // Row 1: Member actions
  const memberRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`party_join:${party.id}`)
      .setLabel("เข้าร่วม")
      .setEmoji("✅")
      .setStyle(ButtonStyle.Success)
      .setDisabled(!isOpen),
    new ButtonBuilder()
      .setCustomId(`party_leave:${party.id}`)
      .setLabel("ออกจากปาร์ตี้")
      .setEmoji("🚪")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!isActive)
  );

  // Row 2: Leader actions
  const leaderRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`party_close:${party.id}`)
      .setLabel("ปิดรับสมาชิก")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!isActive),
    new ButtonBuilder()
      .setCustomId(`party_open:${party.id}`)
      .setLabel("เปิดรับสมาชิก")
      .setEmoji("🔓")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!isClosed),
    new ButtonBuilder()
      .setCustomId(`party_cancel:${party.id}`)
      .setLabel("ยกเลิกปาร์ตี้")
      .setEmoji("❌")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(isCancelled)
  );

  return [memberRow, leaderRow];
}
