import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

export const SOJ_CLASSES = [
  "Ironclad",
  "Sylph",
  "Bloodstorm",
  "Celestune",
  "Nightwaker",
  "Numina",
  "Dragonsvelte",
];

export const data = new SlashCommandBuilder()
  .setName("tangty-soj")
  .setDescription("สร้างปาร์ตี้ SOJ รวมกลุ่มใหม่");

export async function execute(interaction) {
  const classSelect = new StringSelectMenuBuilder()
    .setCustomId("soj_leader_class")
    .setPlaceholder("เลือกอาชีพของคุณ")
    .addOptions(SOJ_CLASSES.map((c) => ({ label: c, value: c })));

  await interaction.reply({
    content: "🧙 เลือกอาชีพของคุณก่อนสร้างปาร์ตี้",
    components: [new ActionRowBuilder().addComponents(classSelect)],
    ephemeral: true,
  });
}
