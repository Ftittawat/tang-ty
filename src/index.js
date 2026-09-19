import "dotenv/config";
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";

import * as partyCmd from "./commands/party.js";
import * as partySojCmd from "./commands/party-soj.js";
import * as partyListCmd from "./commands/party-list-info.js";
import * as interactionCreate from "./events/interactionCreate.js";
import * as partyCheckCmd from "./commands/party-check.js";
import * as logConfigCmd from "./commands/log-config.js";
import * as ready from "./events/ready.js";
import * as voiceStateUpdate from "./events/voiceStateUpdate.js";
import * as guildMemberAdd from "./events/guildMemberAdd.js";
import * as guildMemberRemove from "./events/guildMemberRemove.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates, // log เข้า/ออกห้องเสียง
    GatewayIntentBits.GuildMembers, // log เข้า/ออกเซิร์ฟเวอร์ (privileged intent)
  ],
  partials: [Partials.GuildMember, Partials.User],
});

// ─── Register Commands ────────────────────────────────────────────────
client.commands = new Collection();

client.commands.set("tangty", { execute: partyCmd.execute });
client.commands.set("tangty-soj", { execute: partySojCmd.execute });
client.commands.set("tangty-list", { execute: partyListCmd.listExecute });
client.commands.set("tangty-info", { execute: partyListCmd.infoExecute });
client.commands.set("tangty-party-check", { execute: partyCheckCmd.execute });
client.commands.set("tangty-log", { execute: logConfigCmd.execute });

// ─── Register Events ──────────────────────────────────────────────────
const events = [
  ready,
  interactionCreate,
  voiceStateUpdate,
  guildMemberAdd,
  guildMemberRemove,
];

for (const event of events) {
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// ─── Start ────────────────────────────────────────────────────────────
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("❌ DISCORD_TOKEN not found in environment");
  process.exit(1);
}

client.login(token);
