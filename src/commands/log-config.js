import {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  Colors,
} from "discord.js";
import { getLogConfig, setLogChannel, clearLogChannel } from "../models/log-config.js";
import { formatThaiDateTime } from "../utils/log-embeds.js";

const REQUIRED_PERMS = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.EmbedLinks,
];

export const data = new SlashCommandBuilder()
  .setName("tangty-log")
  .setDescription("ตั้งค่าห้องแจ้งเตือน log ของเซิร์ฟเวอร์นี้")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false)
  .addSubcommand((sub) =>
    sub
      .setName("set")
      .setDescription("เลือก text channel สำหรับส่ง log")
      .addChannelOption((opt) =>
        opt
          .setName("channel")
          .setDescription("ห้องที่จะให้ส่ง log")
          .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName("status").setDescription("ดูการตั้งค่า log ของเซิร์ฟเวอร์นี้")
  )
  .addSubcommand((sub) => sub.setName("off").setDescription("ปิดการแจ้งเตือน log"));

export async function execute(interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply({ content: "❌ ใช้คำสั่งนี้ได้เฉพาะในเซิร์ฟเวอร์", ephemeral: true });
    return;
  }

  const sub = interaction.options.getSubcommand();

  if (sub === "set") {
    const channel = interaction.options.getChannel("channel");

    // ห้องต้องอยู่ในเซิร์ฟเวอร์เดียวกันเสมอ — กัน log ข้ามเซิร์ฟเวอร์
    if (channel.guildId !== interaction.guildId) {
      await interaction.reply({
        content: "❌ ต้องเลือกห้องในเซิร์ฟเวอร์นี้เท่านั้น",
        ephemeral: true,
      });
      return;
    }

    const me = interaction.guild.members.me ?? (await interaction.guild.members.fetchMe());
    if (!channel.permissionsFor(me)?.has(REQUIRED_PERMS)) {
      await interaction.reply({
        content: `❌ บอทไม่มีสิทธิ์ส่งข้อความใน <#${channel.id}>\nต้องการสิทธิ์: \`View Channel\`, \`Send Messages\`, \`Embed Links\``,
        ephemeral: true,
      });
      return;
    }

    setLogChannel(interaction.guildId, channel.id, interaction.user.id);

    await interaction.reply({
      content: `✅ ตั้งค่าห้อง log เป็น <#${channel.id}> แล้ว`,
      ephemeral: true,
    });

    await channel
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle("📝 เปิดใช้งาน Server Log แล้ว")
            .setDescription(
              "ห้องนี้จะได้รับแจ้งเตือนเมื่อมีคน:\n" +
                "• 🔊 เข้า / ออก / ย้ายห้องเสียง (ทุกห้องในเซิร์ฟเวอร์นี้)\n" +
                "• 📥 เข้า / 📤 ออกจากเซิร์ฟเวอร์"
            )
            .setFooter({ text: `ตั้งค่าโดย ${interaction.user.displayName}` })
            .setTimestamp(new Date()),
        ],
      })
      .catch(() => null);
    return;
  }

  if (sub === "status") {
    const config = getLogConfig(interaction.guildId);

    if (!config?.channelId) {
      await interaction.reply({
        content: "📭 เซิร์ฟเวอร์นี้ยังไม่ได้ตั้งค่าห้อง log\nใช้ `/tangty-log set` เพื่อตั้งค่า",
        ephemeral: true,
      });
      return;
    }

    const channel = await interaction.guild.channels.fetch(config.channelId).catch(() => null);
    const channelText = channel ? `<#${channel.id}>` : "⚠️ _ห้องถูกลบไปแล้ว_";
    const updatedAt = config.updatedAt ? formatThaiDateTime(new Date(config.updatedAt)) : "-";
    const updatedBy = config.updatedBy ? `<@${config.updatedBy}>` : "-";

    const embed = new EmbedBuilder()
      .setTitle("📝 การตั้งค่า Server Log")
      .setColor(channel ? Colors.Blurple : Colors.Orange)
      .addFields(
        { name: "ห้อง log", value: channelText, inline: false },
        { name: "ตั้งค่าโดย", value: updatedBy, inline: true },
        { name: "อัปเดตเมื่อ", value: updatedAt, inline: false }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (sub === "off") {
    const cleared = clearLogChannel(interaction.guildId);
    await interaction.reply({
      content: cleared
        ? "🛑 ปิดการแจ้งเตือน log ของเซิร์ฟเวอร์นี้แล้ว"
        : "📭 เซิร์ฟเวอร์นี้ยังไม่ได้ตั้งค่าห้อง log อยู่แล้ว",
      ephemeral: true,
    });
  }
}
