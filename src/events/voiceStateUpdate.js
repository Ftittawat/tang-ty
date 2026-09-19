import { buildLogEmbed, LogEvent } from "../utils/log-embeds.js";
import { sendGuildLog } from "../utils/server-log.js";

export const name = "voiceStateUpdate";

export async function execute(oldState, newState) {
  const guild = newState.guild ?? oldState.guild;
  if (!guild) return;

  const oldChannelId = oldState.channelId;
  const newChannelId = newState.channelId;

  // ไม่สนใจ mute / deafen / stream — เอาเฉพาะตอนเปลี่ยนช่อง
  if (oldChannelId === newChannelId) return;

  const member = newState.member ?? oldState.member;
  const user = member?.user;
  if (!user) return;

  const base = { user, name: user.username, at: new Date() };

  let embed;
  if (!oldChannelId && newChannelId) {
    embed = buildLogEmbed({
      ...base,
      event: LogEvent.VOICE_JOIN,
      channelName: newState.channel?.name,
      categoryName: newState.channel?.parent?.name,
    });
  } else if (oldChannelId && !newChannelId) {
    embed = buildLogEmbed({
      ...base,
      event: LogEvent.VOICE_LEAVE,
      channelName: oldState.channel?.name,
      categoryName: oldState.channel?.parent?.name,
    });
  } else {
    embed = buildLogEmbed({
      ...base,
      event: LogEvent.VOICE_MOVE,
      fromName: oldState.channel?.name,
      toName: newState.channel?.name,
      categoryName: newState.channel?.parent?.name,
    });
  }

  await sendGuildLog(guild, embed);
}
