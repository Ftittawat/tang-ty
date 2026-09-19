import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  Colors,
} from "discord.js";
import {
  createTrip,
  getTrip,
  saveTrip,
  deleteTrip,
  getGuildTrips,
  toggleWant,
  setVisited,
  TripStatus,
} from "../models/trip.js";
import { buildTripEmbed, buildTripComponents } from "../utils/trip-embeds.js";

export const data = new SlashCommandBuilder()
  .setName("tangty-trip")
  .setDescription("To-do list สถานที่เที่ยวที่อยากไป")
  .setDMPermission(false)
  .addSubcommand((sub) =>
    sub.setName("add").setDescription("เพิ่มสถานที่เที่ยวเข้า to-do list")
  )
  .addSubcommand((sub) =>
    sub.setName("list").setDescription("ดูรายการสถานที่เที่ยวทั้งหมดในเซิร์ฟเวอร์นี้")
  );

export async function execute(interaction) {
  if (!interaction.inGuild()) {
    await interaction.reply({ content: "❌ ใช้คำสั่งนี้ได้เฉพาะในเซิร์ฟเวอร์", ephemeral: true });
    return;
  }

  const sub = interaction.options.getSubcommand();
  if (sub === "add") return showAddModal(interaction);
  if (sub === "list") return listTrips(interaction);
}

async function showAddModal(interaction) {
  const modal = new ModalBuilder().setCustomId("modal_add_trip").setTitle("📍 เพิ่มสถานที่เที่ยว");

  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("place")
        .setLabel("สถานที่เที่ยว")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("เช่น เชียงใหม่, ทะเลหัวหิน, คาเฟ่เขาใหญ่")
        .setMaxLength(100)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("note")
        .setLabel("รายละเอียด (ไม่บังคับ)")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("เช่น ช่วงหน้าหนาว, งบ 3000, ไป 2 วัน 1 คืน")
        .setMaxLength(500)
        .setRequired(false)
    )
  );

  await interaction.showModal(modal);
}

async function listTrips(interaction) {
  const trips = getGuildTrips(interaction.guildId);

  if (trips.length === 0) {
    await interaction.reply({
      content: "📭 ยังไม่มีสถานที่เที่ยวในเซิร์ฟเวอร์นี้\nใช้ `/tangty-trip add` เพื่อเพิ่ม",
      ephemeral: true,
    });
    return;
  }

  const line = (t) =>
    `📍 **${t.place}** — 🙋 ${t.wantList.length} คน | เพิ่มโดย <@${t.creatorId}> | ID: \`${t.id}\``;

  const want = trips.filter((t) => t.status === TripStatus.WANT);
  const visited = trips.filter((t) => t.status === TripStatus.VISITED);

  const embed = new EmbedBuilder()
    .setTitle("🧳 รายการสถานที่เที่ยว")
    .setColor(Colors.Gold);

  if (want.length > 0) {
    embed.addFields({
      name: `🕒 อยากไป (${want.length})`,
      value: truncate(want.map(line).join("\n")),
      inline: false,
    });
  }
  if (visited.length > 0) {
    embed.addFields({
      name: `✅ ไปแล้ว (${visited.length})`,
      value: truncate(visited.map(line).join("\n")),
      inline: false,
    });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

function truncate(text) {
  return text.length > 1024 ? `${text.slice(0, 1000)}\n… (ดูเพิ่มเติมด้วย Trip ID)` : text;
}

/**
 * จัดการ modal + ปุ่มของ trip
 * คืน true ถ้าเป็น interaction ของ trip (จัดการแล้ว)
 */
export async function handleTripInteraction(interaction, client) {
  // ─── เพิ่มสถานที่จาก modal ───────────────────────────────────────
  if (interaction.isModalSubmit() && interaction.customId === "modal_add_trip") {
    const place = interaction.fields.getTextInputValue("place").trim();
    const note = interaction.fields.getTextInputValue("note").trim() || null;

    if (!place) {
      await interaction.reply({ content: "❌ กรุณาระบุสถานที่เที่ยว", ephemeral: true });
      return true;
    }

    const trip = createTrip({
      place,
      note,
      guildId: interaction.guildId,
      creatorId: interaction.user.id,
      creatorName: interaction.user.displayName,
    });

    await interaction.reply({
      embeds: [buildTripEmbed(trip)],
      components: buildTripComponents(trip),
    });

    const msg = await interaction.fetchReply();
    trip.messageId = msg.id;
    trip.channelId = interaction.channelId;
    saveTrip(trip);

    console.log(
      `🧳 [Trip Added] id=${trip.id} place="${trip.place}"` +
        ` | by="${interaction.user.displayName}" (${interaction.user.id})` +
        ` | server="${interaction.guild?.name}" (${interaction.guildId})`
    );
    return true;
  }

  if (!interaction.isButton()) return false;

  const [action, tripId] = interaction.customId.split(":");
  if (!["trip_want", "trip_visited", "trip_delete"].includes(action) || !tripId) return false;

  const trip = getTrip(tripId);
  if (!trip) {
    await interaction.reply({ content: "❌ ไม่พบรายการนี้ (อาจถูกลบไปแล้ว)", ephemeral: true });
    return true;
  }

  // รายการของเซิร์ฟเวอร์อื่นกดจากที่นี่ไม่ได้
  if (trip.guildId !== interaction.guildId) {
    await interaction.reply({ content: "❌ รายการนี้ไม่ได้อยู่ในเซิร์ฟเวอร์นี้", ephemeral: true });
    return true;
  }

  switch (action) {
    case "trip_want": {
      if (trip.status === TripStatus.VISITED) {
        await interaction.reply({ content: "❌ รายการนี้ไปมาแล้ว", ephemeral: true });
        return true;
      }

      const result = toggleWant(trip, interaction.user.id, interaction.user.displayName);
      saveTrip(trip);

      await interaction.update({
        embeds: [buildTripEmbed(trip)],
        components: buildTripComponents(trip),
      });
      await interaction.followUp({
        content:
          result === "added"
            ? `🙋 บันทึกแล้วว่า **${interaction.user.displayName}** อยากไป **${trip.place}**`
            : `↩️ ยกเลิกแล้ว — **${interaction.user.displayName}** ไม่ได้อยู่ในรายชื่อคนอยากไป`,
        ephemeral: true,
      });
      return true;
    }

    case "trip_visited": {
      if (!canManage(interaction, trip)) {
        await interaction.reply({
          content: "❌ เฉพาะผู้เพิ่มรายการ หรือผู้ที่มีสิทธิ์ `Manage Server` เท่านั้น",
          ephemeral: true,
        });
        return true;
      }

      setVisited(trip, trip.status !== TripStatus.VISITED);
      saveTrip(trip);

      await interaction.update({
        embeds: [buildTripEmbed(trip)],
        components: buildTripComponents(trip),
      });
      return true;
    }

    case "trip_delete": {
      if (!canManage(interaction, trip)) {
        await interaction.reply({
          content: "❌ เฉพาะผู้เพิ่มรายการ หรือผู้ที่มีสิทธิ์ `Manage Server` เท่านั้น",
          ephemeral: true,
        });
        return true;
      }

      deleteTrip(trip.id);

      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setTitle(`🗑️ ลบรายการแล้ว`)
            .setDescription(`~~📍 ${trip.place}~~`)
            .setColor(Colors.Grey)
            .setFooter({ text: `ลบโดย ${interaction.user.displayName}` })
            .setTimestamp(new Date()),
        ],
        components: [],
      });
      return true;
    }
  }

  return false;
}

function canManage(interaction, trip) {
  if (interaction.user.id === trip.creatorId) return true;
  return interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ?? false;
}
