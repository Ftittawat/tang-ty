import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } from "discord.js";
import { TripStatus } from "../models/trip.js";

export function buildTripEmbed(trip) {
  const isVisited = trip.status === TripStatus.VISITED;

  const wantText =
    trip.wantList.length === 0
      ? "_ยังไม่มีใครกดอยากไป_"
      : trip.wantList.map((u, i) => `${i + 1}. <@${u.id}>`).join("\n");

  const embed = new EmbedBuilder()
    .setTitle(`📍 ${trip.place}`)
    .setColor(isVisited ? Colors.Green : Colors.Gold)
    .addFields(
      { name: "สถานะ", value: isVisited ? "✅ ไปแล้ว" : "🕒 อยากไป", inline: true },
      { name: "ผู้เพิ่ม", value: `<@${trip.creatorId}>`, inline: true },
      {
        name: `👋 คนที่อยากไป (${trip.wantList.length})`,
        value: wantText,
        inline: false,
      }
    )
    .setFooter({ text: `Trip ID: ${trip.id}` })
    .setTimestamp(new Date(trip.createdAt));

  if (trip.note) {
    embed.setDescription(trip.note);
  }

  return embed;
}

export function buildTripComponents(trip) {
  const isVisited = trip.status === TripStatus.VISITED;

  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`trip_want:${trip.id}`)
        .setLabel("อยากไป")
        .setEmoji("🙋")
        .setStyle(ButtonStyle.Success)
        .setDisabled(isVisited),
      new ButtonBuilder()
        .setCustomId(`trip_visited:${trip.id}`)
        .setLabel(isVisited ? "ยังไม่ได้ไป" : "ไปแล้ว")
        .setEmoji(isVisited ? "↩️" : "✅")
        .setStyle(isVisited ? ButtonStyle.Secondary : ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`trip_delete:${trip.id}`)
        .setLabel("ลบรายการ")
        .setEmoji("🗑️")
        .setStyle(ButtonStyle.Danger)
    ),
  ];
}
