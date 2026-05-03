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
  
  const embed = new EmbedBuilder()
    .setColor(0x5865F2) // สี (โทน Discord)
    .setTitle("🎮 **[ โพสต์สอบถามวันที่สะดวกลงดันสัปดาห์นี้ ]**")
    .setDescription(
    `
    📅 เลือกวันที่คุณ "สะดวกลงดัน"

    🌙 จันทร์     🔥 อังคาร     🌿 พุธ  
    ⚡ พฤหัส     🎉 ศุกร์     🍻 เสาร์  
    🌞 อาทิตย์

    ❌ พัก / ไม่ว่าง

    ⚔️ กด emoji ด้านล่างเพื่อเลือกวัน`
  )
    .setThumbnail("https://i.imgur.com/8Km9tLL.png")
    .setImage("https://i.imgur.com/Z6a9Z6F.png");

  for (const emoji of Object.values(DAY_EMOJIS)) {
    await message.react(emoji);
  }

  await interaction.deleteReply();
}