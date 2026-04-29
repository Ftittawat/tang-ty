import { getAllParties, saveParty, PartyStatus } from "../models/party.js";
import { buildPartyEmbed } from "../utils/embeds.js";
import { buildPartyComponents } from "../utils/components.js";

export const name = "ready";
export const once = true;

export async function execute(client) {
  console.log(`✅ ${client.user.tag} พร้อมใช้งานแล้ว!`);

  // Check deadlines every 60 seconds
  setInterval(() => checkDeadlines(client), 60_000);
}

async function checkDeadlines(client) {
  const now = new Date();
  const parties = getAllParties();

  for (const party of parties) {
    if (![PartyStatus.OPEN, PartyStatus.FULL].includes(party.status)) continue;
    if (new Date(party.deadline) > now) continue;

    party.status = PartyStatus.CLOSED;
    saveParty(party);
    console.log(`⏰ Auto-closed party ${party.id} (${party.activity})`);

    // Try to update the original message
    if (party.channelId && party.messageId) {
      try {
        const channel = await client.channels.fetch(party.channelId);
        const msg = await channel.messages.fetch(party.messageId);
        await msg.edit({
          embeds: [buildPartyEmbed(party)],
          components: buildPartyComponents(party),
        });
      } catch (err) {
        console.warn(`Could not update message for party ${party.id}: ${err.message}`);
      }
    }
  }
}
