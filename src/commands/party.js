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

  const dateInput = new TextInputBuilder()
    .setCustomId("date")
    .setLabel("วัน (DD/MM/YYYY)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("เช่น 25/12/2025")
    .setMaxLength(10)
    .setRequired(true);

  const timeInput = new TextInputBuilder()
    .setCustomId("time")
    .setLabel("เวลา (HH:MM)")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("เช่น 18:00")
    .setMaxLength(5)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(activityInput),
    new ActionRowBuilder().addComponents(maxMembersInput),
    new ActionRowBuilder().addComponents(dateInput),
    new ActionRowBuilder().addComponents(timeInput)
  );

  await interaction.showModal(modal);
}
