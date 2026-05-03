import "dotenv/config";
import { Client, Collection, GatewayIntentBits } from "discord.js";

import * as partyCmd from "./commands/party.js";
import * as partySojCmd from "./commands/party-soj.js";
import * as partyListCmd from "./commands/party-list-info.js";
import * as interactionCreate from "./events/interactionCreate.js";
import * as partyCheckCmd from "./commands/party-check.js";
import * as ready from "./events/ready.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// ─── Register Commands ────────────────────────────────────────────────
client.commands = new Collection();

client.commands.set("tangty", { execute: partyCmd.execute });
client.commands.set("tangty-soj", { execute: partySojCmd.execute });
client.commands.set("tangty-list", { execute: partyListCmd.listExecute });
client.commands.set("tangty-info", { execute: partyListCmd.infoExecute });
client.commands.set("tangty-party-check", { execute: partyCheckCmd.execute });

// ─── Register Events ──────────────────────────────────────────────────
const events = [ready, interactionCreate];

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
