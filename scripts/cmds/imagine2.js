const axios = require("axios");

module.exports = {
  config: {
    name: "imagine2",
    aliases: ["img2", "edits"],
    version: "1.0",
    author: "S AY EM",
    countDown: 5,
    role: 0,
    shortDescription: "Generate AI image",
    longDescription: "Generate AI image using prompt",
    category: "ai",
    guide: "{pn} <prompt>"
  },

  onStart: async function ({ message, args, event, api }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply("Please enter a prompt.");

    try {

      // loading react
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const apiUrl = `https://sayem-online-all-apixs.vercel.app/api/api/ai/imagine?p=${encodeURIComponent(prompt)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.result)
        return message.reply("Failed to generate image.");

      const img = await axios.get(res.data.result, { responseType: "stream" });

      setTimeout(() => {

        // tick react
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        message.reply({
          body: ` Image generated`,
          attachment: img.data
        });

      }, 3000);

    } catch (err) {
      console.error(err);
      return message.reply("❌ Error generating image.");
    }
  }
};