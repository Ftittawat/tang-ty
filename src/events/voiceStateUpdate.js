import { buildVoiceLogEmbed, LogEvent } from "../utils/log-embeds.js";
import { sendGuildLog } from "../utils/server-log.js";

export const name = "voiceStateUpdate";

export async function execute(oldState, newState) {
  const guild = newState.guild ?? oldState.guild;
  if (!guild) return;

  const oldChannelId = oldState.channelId;
  const newChannelId = newState.channelId;

  // ไม่สนใจ mute / deafen / stream — เอาเฉพาะตอนเปลี่ยนห้อง
  if (oldChannelId === newChannelId) return;

  const member = newState.member ?? oldState.member;
  const user = member?.user;
  if (!user) return;

  const displayName = member.displayName ?? user.displayName ?? user.username;
  const at = new Date();

  let embed;
  if (!oldChannelId && newChannelId) {
    embed = buildVoiceLogEmbed({
      event: LogEvent.VOICE_JOIN,
      user,
      displayName,
      channelName: newState.channel?.name,
      channelId: newChannelId,
      at,
    });
  } else if (oldChannelId && !newChannelId) {
    embed = buildVoiceLogEmbed({
      event: LogEvent.VOICE_LEAVE,
      user,
      displayName,
      channelName: oldState.channel?.name,
      channelId: oldChannelId,
      at,
    });
  } else {
    embed = buildVoiceLogEmbed({
      event: LogEvent.VOICE_MOVE,
      user,
      displayName,
      fromName: oldState.channel?.name,
      fromId: oldChannelId,
      toName: newState.channel?.name,
      toId: newChannelId,
      at,
    });
  }

  await sendGuildLog(guild, embed);
}
