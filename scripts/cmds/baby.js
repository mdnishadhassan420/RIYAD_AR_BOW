const axios = require("axios");

const BaseApiUrl = "https://ariful-online-baby-api.onrender.com";

const activeUsers = new Set();

const randomReplies = [
  "I am here😃",
  "ডাকলেই চলে আসি তোমার জন্য-!!😒",
  "Type /help baby",
  "Kicce ato dakis ken-!!😒",
  "Asi baby bolo go-!!😙",
  "Ato daka daki na kore akta prem korai dew-!!😗"
];

module.exports = {
  config: {
    name: "baby",
    aliases: ["bby"],
    version: "5.3",
    author: "Ariful--",
    countDown: 2,
    role: 0,
    shortDescription: "Chat + Teach",
    longDescription: "Random trigger + reply AI system + list",
    category: "chat",
    guide: {
      en: "{pn} hi\n{pn} teach hi - hello\n{pn} list"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const sender = event.senderID;
      activeUsers.add(sender);

      const input = args.join(" ").trim();

      if (!input) {
        return api.sendMessage(
          "❌ | Use:\n• baby hi\n• baby teach hi - hello\n• baby list",
          event.threadID,
          event.messageID
        );
      }

      if (input.toLowerCase() === "list") {
        const res = await axios.get(`${BaseApiUrl}/list`);

        return api.sendMessage(
          `❄️Total Questions: ${res.data.total_questions}\n💬 Total Answers: ${res.data.total_answers}`,
          event.threadID,
          event.messageID
        );
      }

      if (input.toLowerCase().startsWith("teach ")) {
        const data = input.slice(6).split("-");
        if (data.length < 2) {
          return api.sendMessage(
            "❌ | Format: baby teach hi - hello",
            event.threadID,
            event.messageID
          );
        }

        const ask = data[0].trim();
        const ans = data.slice(1).join("-").trim();

        await axios.get(
          `${BaseApiUrl}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`
        );

        return api.sendMessage(
          `✅ | Replies Successfully...!\n \n🗨️ ${ask}\n\n💬 ${ans}`,
          event.threadID,
          event.messageID
        );
      }

      const res = await axios.get(
        `${BaseApiUrl}/chat?ask=${encodeURIComponent(input)}`
      );

      const reply =
        res.data?.answer ||
        res.data?.reply ||
        res.data?.message ||
        "😐 | No response!";

      return api.sendMessage(reply, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage(
        "⚠️ | API error!",
        event.threadID,
        event.messageID
      );
    }
  },

  onChat: async function ({ api, event }) {
    try {
      const sender = event.senderID;
      const msg = event.body?.toLowerCase().trim();

      if (["baby", "bby"].includes(msg)) {
        activeUsers.add(sender);
        const randomReply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
        return api.sendMessage(randomReply, event.threadID, event.messageID);
      }

      if (!activeUsers.has(sender)) return;

      if (
        event.messageReply &&
        event.messageReply.senderID == api.getCurrentUserID()
      ) {
        const userMsg = event.body?.trim();
        if (!userMsg) return;

        const res = await axios.get(
          `${BaseApiUrl}/chat?ask=${encodeURIComponent(userMsg)}`
        );

        const reply =
          res.data?.answer ||
          res.data?.reply ||
          res.data?.message ||
          "😐 | No response!";

        return api.sendMessage(reply, event.threadID, event.messageID);
      }

    } catch (e) {
      console.log(e);
    }
  }
};