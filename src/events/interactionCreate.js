import {
  ActionRowBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import {
  createParty,
  getParty,
  saveParty,
  PartyStatus,
  isMember,
  isLeader,
  addMember,
  removeMember,
} from "../models/party.js";
import { buildPartyEmbed } from "../utils/embeds.js";
import { buildPartyComponents } from "../utils/components.js";
import { SOJ_CLASSES } from "../commands/party-soj.js";

export const name = "interactionCreate";

// Temp storage for SOJ class selection between select-menu and modal submit
const pendingLeaderClass = new Map();

export async function execute(interaction, client) {
  // ─── Slash Commands ───────────────────────────────────────────────
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      const msg = { content: "❌ เกิดข้อผิดพลาด", ephemeral: true };
      interaction.replied ? await interaction.followUp(msg) : await interaction.reply(msg);
    }
    return;
  }

  // ─── String Select Menu ───────────────────────────────────────────
  if (interaction.isStringSelectMenu()) {
    // Leader class selection before creating SOJ party
    if (interaction.customId === "soj_leader_class") {
      pendingLeaderClass.set(interaction.user.id, interaction.values[0]);

      const modal = new ModalBuilder()
        .setCustomId("modal_create_party_soj")
        .setTitle("🎯 สร้างปาร์ตี้ SOJ");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("activity")
            .setLabel("ชื่อกิจกรรม")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("เช่น Sword of Justice Hard, SOJ Normal")
            .setMaxLength(100)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("max_members")
            .setLabel("จำนวนสมาชิกสูงสุด")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("เช่น 4")
            .setMaxLength(3)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("deadline")
            .setLabel("วันเวลาปิดรับสมาชิก (DD/MM/YYYY HH:MM)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("เช่น 25/12/2025 18:00")
            .setMaxLength(16)
            .setRequired(true)
        )
      );

      await interaction.showModal(modal);
      return;
    }

    // Member class selection when joining a SOJ party
    if (interaction.customId.startsWith("soj_join_class:")) {
      const partyId = interaction.customId.split(":")[1];
      const selectedClass = interaction.values[0];

      const party = getParty(partyId);
      if (!party) {
        await interaction.update({ content: "❌ ไม่พบปาร์ตี้นี้", components: [] });
        return;
      }

      const userId = interaction.user.id;
      const userName = interaction.user.displayName;

      if (party.status === PartyStatus.CANCELLED) {
        await interaction.update({ content: "❌ ปาร์ตี้นี้ถูกยกเลิกแล้ว", components: [] });
        return;
      }
      if (party.status === PartyStatus.CLOSED) {
        await interaction.update({ content: "❌ ปาร์ตี้ปิดรับสมาชิกแล้ว", components: [] });
        return;
      }
      if (isMember(party, userId)) {
        await interaction.update({ content: "⚠️ คุณอยู่ในปาร์ตี้นี้แล้ว", components: [] });
        return;
      }
      if (party.members.length >= party.maxMembers) {
        await interaction.update({ content: "❌ ปาร์ตี้เต็มแล้ว", components: [] });
        return;
      }

      addMember(party, userId, userName, selectedClass);
      saveParty(party);

      // Update the ephemeral class-select message
      await interaction.update({
        content: `✅ เข้าร่วมปาร์ตี้ในฐานะ **${selectedClass}** แล้ว!`,
        components: [],
      });

      // Update the original party message
      if (party.channelId && party.messageId) {
        const channel = await client.channels.fetch(party.channelId);
        const message = await channel.messages.fetch(party.messageId);
        await message.edit({
          embeds: [buildPartyEmbed(party)],
          components: buildPartyComponents(party),
        });
      }
      return;
    }

    return;
  }

  // ─── Modal Submit ─────────────────────────────────────────────────
  if (
    interaction.isModalSubmit() &&
    (interaction.customId === "modal_create_party" ||
      interaction.customId === "modal_create_party_soj")
  ) {
    const isSoj = interaction.customId === "modal_create_party_soj";
    const activity = interaction.fields.getTextInputValue("activity").trim();
    const maxMembersRaw = interaction.fields.getTextInputValue("max_members").trim();
    const deadlineRaw = interaction.fields.getTextInputValue("deadline").trim();

    const maxMembers = parseInt(maxMembersRaw, 10);
    if (isNaN(maxMembers) || maxMembers < 2 || maxMembers > 50) {
      await interaction.reply({ content: "❌ จำนวนสมาชิกต้องเป็นตัวเลข 2-50", ephemeral: true });
      return;
    }

    const match = deadlineRaw.match(/^(\d{2})\/(\d{2})\/(\d{4})\s(\d{2}):(\d{2})$/);
    if (!match) {
      await interaction.reply({
        content: "❌ รูปแบบวันเวลาไม่ถูกต้อง กรุณาใช้ DD/MM/YYYY HH:MM\nเช่น 25/12/2025 18:00",
        ephemeral: true,
      });
      return;
    }

    const [, dd, mm, yyyy, hh, min] = match;
    const deadline = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00`);
    if (isNaN(deadline.getTime()) || deadline <= new Date()) {
      await interaction.reply({
        content: "❌ วันเวลาปิดรับสมาชิกต้องเป็นอนาคต",
        ephemeral: true,
      });
      return;
    }

    const leaderClass = isSoj ? (pendingLeaderClass.get(interaction.user.id) ?? null) : null;
    if (isSoj) pendingLeaderClass.delete(interaction.user.id);

    const party = createParty({
      activity,
      leaderId: interaction.user.id,
      leaderName: interaction.user.displayName,
      maxMembers,
      deadline,
      type: isSoj ? "soj" : "regular",
      leaderClass,
    });

    const embed = buildPartyEmbed(party);
    const components = buildPartyComponents(party);

    await interaction.reply({ embeds: [embed], components });
    const msg = await interaction.fetchReply();

    party.messageId = msg.id;
    party.channelId = interaction.channelId;
    party.guildId = interaction.guildId;
    saveParty(party);
    return;
  }

  // ─── Button Interactions ──────────────────────────────────────────
  if (!interaction.isButton()) return;

  const [action, partyId] = interaction.customId.split(":");
  if (!partyId) return;

  const party = getParty(partyId);
  if (!party) {
    await interaction.reply({ content: "❌ ไม่พบปาร์ตี้นี้", ephemeral: true });
    return;
  }

  const userId = interaction.user.id;
  const userName = interaction.user.displayName;

  switch (action) {
    case "party_join": {
      if (party.status === PartyStatus.CANCELLED) {
        await interaction.reply({ content: "❌ ปาร์ตี้นี้ถูกยกเลิกแล้ว", ephemeral: true });
        return;
      }
      if (party.status === PartyStatus.CLOSED) {
        await interaction.reply({ content: "❌ ปาร์ตี้ปิดรับสมาชิกแล้ว", ephemeral: true });
        return;
      }
      if (isMember(party, userId)) {
        await interaction.reply({ content: "⚠️ คุณอยู่ในปาร์ตี้นี้แล้ว", ephemeral: true });
        return;
      }
      if (party.members.length >= party.maxMembers) {
        await interaction.reply({ content: "❌ ปาร์ตี้เต็มแล้ว", ephemeral: true });
        return;
      }

      // SOJ party: require class selection before joining
      if (party.type === "soj") {
        const classSelect = new StringSelectMenuBuilder()
          .setCustomId(`soj_join_class:${partyId}`)
          .setPlaceholder("เลือกอาชีพของคุณ")
          .addOptions(SOJ_CLASSES.map((c) => ({ label: c, value: c })));

        await interaction.reply({
          content: "🧙 เลือกอาชีพของคุณก่อนเข้าร่วมปาร์ตี้",
          components: [new ActionRowBuilder().addComponents(classSelect)],
          ephemeral: true,
        });
        return;
      }

      addMember(party, userId, userName);
      saveParty(party);
      break;
    }

    case "party_leave": {
      if (!isMember(party, userId)) {
        await interaction.reply({ content: "⚠️ คุณไม่ได้อยู่ในปาร์ตี้นี้", ephemeral: true });
        return;
      }
      if (isLeader(party, userId)) {
        await interaction.reply({
          content: "⚠️ หัวหน้าปาร์ตี้ไม่สามารถออกได้ กรุณายกเลิกปาร์ตี้แทน",
          ephemeral: true,
        });
        return;
      }
      removeMember(party, userId);
      saveParty(party);
      break;
    }

    case "party_close": {
      if (!isLeader(party, userId)) {
        await interaction.reply({ content: "❌ เฉพาะหัวหน้าปาร์ตี้เท่านั้น", ephemeral: true });
        return;
      }
      if (![PartyStatus.OPEN, PartyStatus.FULL].includes(party.status)) {
        await interaction.reply({ content: "❌ ไม่สามารถปิดรับสมาชิกได้ในขณะนี้", ephemeral: true });
        return;
      }
      party.status = PartyStatus.CLOSED;
      saveParty(party);
      break;
    }

    case "party_open": {
      if (!isLeader(party, userId)) {
        await interaction.reply({ content: "❌ เฉพาะหัวหน้าปาร์ตี้เท่านั้น", ephemeral: true });
        return;
      }
      if (party.status !== PartyStatus.CLOSED) {
        await interaction.reply({ content: "❌ ปาร์ตี้ไม่ได้ถูกปิดรับสมาชิก", ephemeral: true });
        return;
      }
      party.status =
        party.members.length >= party.maxMembers ? PartyStatus.FULL : PartyStatus.OPEN;
      saveParty(party);
      break;
    }

    case "party_cancel": {
      if (!isLeader(party, userId)) {
        await interaction.reply({ content: "❌ เฉพาะหัวหน้าปาร์ตี้เท่านั้น", ephemeral: true });
        return;
      }
      if (party.status === PartyStatus.CANCELLED) {
        await interaction.reply({ content: "❌ ปาร์ตี้ถูกยกเลิกแล้ว", ephemeral: true });
        return;
      }
      party.status = PartyStatus.CANCELLED;
      saveParty(party);
      break;
    }

    default:
      return;
  }

  // Update the message embed + buttons
  const embed = buildPartyEmbed(party);
  const components = buildPartyComponents(party);
  await interaction.update({ embeds: [embed], components });
}
