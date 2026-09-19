import { buildMemberLogEmbed, LogEvent } from "../utils/log-embeds.js";
import { sendGuildLog } from "../utils/server-log.js";

export const name = "guildMemberAdd";

export async function execute(member) {
  const guild = member.guild;
  if (!guild) return;

  const user = member.user;
  if (!user) return;

  const embed = buildMemberLogEmbed({
    event: LogEvent.SERVER_JOIN,
    user,
    displayName: member.displayName ?? user.displayName ?? user.username,
    at: new Date(),
    memberCount: guild.memberCount,
  });

  await sendGuildLog(guild, embed);
}
