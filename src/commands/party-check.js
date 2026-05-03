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
  };

export async function execute(interaction) {
  const message = await interaction.channel.send(
    `📅 **กด emoji เพื่อเลือกวันว่าง**

      🌙 จันทร์
      🔥 อังคาร
      🌿 พุธ
      ⚡ พฤหัส
      🎉 ศุกร์
      🍻 เสาร์
      🌞 อาทิตย์`
  );

  // ใส่ reaction ให้ครบ
  for (const emoji of Object.values(DAY_EMOJIS)) {
    await message.react(emoji);
  }

  await interaction.reply({ content: "สร้างโพสต์แล้ว", ephemeral: true });
}