import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("tangty")
  .setDescription("สร้างปาร์ตี้รวมกลุ่มใหม่");

export async function execute(interaction) {
  const modal = new ModalBuilder()
    .setCustomId("modal_create_party")
    .setTitle("🎯 สร้างปาร์ตี้ใหม่");

  const activityInput = new TextInputBuilder()
    .setCustomId("activity")
    .setLabel("ชื่อกิจกรรม")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("เช่น กินข้าวเที่ยง, เล่น Valorant, ดูหนัง")
    .setMaxLength(100)
    .setRequired(true);

  const maxMembersInput = new TextInputBuilder()
    .setCustomId("max_members")
    .setLabel("จำนวนสมาชิกสูงสุด")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("เช่น 4")
    .setMaxLength(3)
    .setRequired(true);

  const deadlineInput = new TextInputBuilder()
    .setCustomId("deadline")
    .setLabel("วันเวลาปิดรับสมาชิก (DD/MM/YYYY HH:MM)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("เช่น 25/12/2025 18:00")
    .setMaxLength(16)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(activityInput),
    new ActionRowBuilder().addComponents(maxMembersInput),
    new ActionRowBuilder().addComponents(deadlineInput)
  );

  await interaction.showModal(modal);
}
