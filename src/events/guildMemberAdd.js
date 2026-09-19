import { buildLogEmbed, LogEvent } from "../utils/log-embeds.js";
import { sendGuildLog } from "../utils/server-log.js";

export const name = "guildMemberAdd";

export async function execute(member) {
  const guild = member.guild;
  const user = member.user;
  if (!guild || !user) return;

  await sendGuildLog(
    guild,
    buildLogEmbed({
      event: LogEvent.SERVER_JOIN,
      user,
      name: user.username,
      at: new Date(),
    })
  );
}
