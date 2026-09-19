import { buildLogEmbed, LogEvent } from "../utils/log-embeds.js";
import { sendGuildLog } from "../utils/server-log.js";

export const name = "guildMemberRemove";

export async function execute(member) {
  const guild = member.guild;
  // member อาจเป็น partial ตอนออกจากเซิร์ฟเวอร์
  const user = member.user;
  if (!guild || !user) return;

  await sendGuildLog(
    guild,
    buildLogEmbed({
      event: LogEvent.SERVER_LEAVE,
      user,
      name: user.username,
      at: new Date(),
    })
  );
}
