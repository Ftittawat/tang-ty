import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("tangty-party-check")
  .setDescription("สร้างโพสต์ให้กดวันว่าง");

  const DAY_EMOJIS = {
    mon: "🌙",
    tue: "🔥",
    wed: "🌿",
    thu: "⚡",
    fri: "🎉",
    sat: "🍻",
    sun: "🌞",
    not: "❌",
  };

export async function execute(interaction) {
  await interaction.reply({ content: "กำลังสร้างโพสต์...", ephemeral: true });
  
  const message = await interaction.channel.send(
    `📅 **กด emoji เพื่อเลือกวันว่าง**

      🌙 จันทร์
      🔥 อังคาร
      🌿 พุธ
      ⚡ พฤหัส
      🎉 ศุกร์
      🍻 เสาร์
      🌞 อาทิตย์
      ❌ ไม่ว่าง`
  );

  for (const emoji of Object.values(DAY_EMOJIS)) {
    await message.react(emoji);
  }

  await interaction.deleteReply();
}