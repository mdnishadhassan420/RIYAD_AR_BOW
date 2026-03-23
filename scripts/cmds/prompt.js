const axios = require("axios");

module.exports = {
  config: {
    name: "prompt",
    aliases: ["p"],
    version: "3.0",
    author: "Ariyan",
    countDown: 5,
    role: 0,
    category: "ai",
    shortDescription: "Generate detailed visual prompt",
    longDescription: "Generate highly detailed prompt from text or replied image",
    guide: "{pn} [text] or reply to image"
  },

  onStart: async function ({ message, event, args }) {
    try {
      let imgUrl = event.messageReply?.attachments?.[0]?.type === "photo" 
                    ? event.messageReply.attachments[0].url 
                    : null;

      let userPrompt = !imgUrl && args.length ? args.join(" ") : null;

      if (!imgUrl && !userPrompt) 
        return message.reply("⚠ Provide a text prompt or reply to an image.");

      message.reaction("⏳", event.messageID);

      const apiUrl = imgUrl 
        ? `http://45.130.164.219:8000/api/prompt?img=${encodeURIComponent(imgUrl)}`
        : `http://45.130.164.219:8000/api/prompt?prompt=${encodeURIComponent(userPrompt)}`;

      const res = await axios.get(apiUrl, { timeout: 90000 });

      if (!res.data?.status) {
        message.reaction("❌", event.messageID);
        return message.reply("❌ API Error: " + (res.data?.error || "Unknown error"));
      }

      message.reaction("✅", event.messageID);
      return message.reply(res.data.prompt);

    } catch (err) {
      message.reaction("❌", event.messageID);
      return message.reply("❌ Failed: " + err.message);
    }
  }
};