/**
 * Run this once to register slash commands with Discord:
 *   node src/deploy-commands.js
 */
import "dotenv/config";
import { REST, Routes } from "discord.js";
import * as partyCmd from "./commands/party.js";
import * as partySojCmd from "./commands/party-soj.js";
import * as partyListCmd from "./commands/party-list-info.js";
import * as partyCheckCmd from "./commands/party-check.js";

const commands = [
  partyCmd.data.toJSON(),
  partySojCmd.data.toJSON(),
  partyListCmd.listData.toJSON(),
  partyListCmd.infoData.toJSON(),
  partyCheckCmd.data.toJSON(),
];

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("🔄 Registering slash commands...");

    // Guild-scoped (instant update) — recommended for development
    // Replace GUILD_ID or set in .env for faster testing
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`✅ Commands registered to guild ${process.env.GUILD_ID}`);
    } else {
      // Global commands (takes up to 1 hour to propagate)
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
      console.log("✅ Global commands registered (may take up to 1 hour)");
    }
  } catch (err) {
    console.error("❌ Failed to register commands:", err);
    process.exit(1);
  }
})();
