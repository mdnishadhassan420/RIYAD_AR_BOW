const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

module.exports = {
  config: {
    name: "mj",
    version: "3.3",
    role: 2,
    author: "S AY EM",
    countDown: 60,
    category: "ai"
  },

  onStart: async function ({ api, event, args, message }) {

    if (!args.length) return message.reply("Give me a prompt.");

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {

      const prompt = encodeURIComponent(args.join(" "));

      const res = await axios.get(
        `https://sayem-online-all-apixs.vercel.app/api/api/ai/midjourney3?p=${prompt}`
      );

      if (!res.data.status || !Array.isArray(res.data.result))
        return message.reply("Generation failed.");

      const urls = res.data.result.slice(0, 4);

      const buffers = await Promise.all(
        urls.map(u =>
          axios.get(u, { responseType: "arraybuffer" }).then(r => r.data)
        )
      );

      const meta = await sharp(buffers[0]).metadata();
      const w = meta.width;
      const h = meta.height;

      const grid = await sharp({
        create: {
          width: w * 2,
          height: h * 2,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
      .composite([
        { input: buffers[0], left: 0, top: 0 },
        { input: buffers[1], left: w, top: 0 },
        { input: buffers[2], left: 0, top: h },
        { input: buffers[3], left: w, top: h }
      ])
      .png()
      .toBuffer();

      const file = path.join(__dirname, `mj_${event.senderID}.png`);
      fs.writeFileSync(file, grid);

      api.sendMessage(
        {
          body: "✨ MidJourney Result\nReply with U1 | U2 | U3 | U4",
          attachment: fs.createReadStream(file)
        },
        event.threadID,
        (err, info) => {

          fs.unlinkSync(file);
          if (err) return;

          api.setMessageReaction("✅", event.messageID, () => {}, true);

          global.GoatBot.onReply.set(info.messageID, {
            commandName: "mj",
            author: event.senderID,
            urls
          });

        },
        event.messageID
      );

    } catch (e) {

      console.log("MJ ERROR:", e?.response?.data || e.message);
      message.reply("Error generating image.");

    }
  },

  onReply: async function ({ api, event, Reply, message }) {

    if (event.senderID !== Reply.author) return;

    const map = { U1: 0, U2: 1, U3: 2, U4: 3 };
    const input = event.body.trim().toUpperCase();

    if (!(input in map))
      return message.reply("Reply with U1, U2, U3, or U4.");

    try {

      const img = await axios.get(
        Reply.urls[map[input]],
        { responseType: "arraybuffer" }
      );

      const file = path.join(__dirname, `mj_${input}_${event.senderID}.png`);
      fs.writeFileSync(file, img.data);

      api.sendMessage(
        {
          body: `✨ ${input}`,
          attachment: fs.createReadStream(file)
        },
        event.threadID,
        () => fs.unlinkSync(file),
        event.messageID
      );

    } catch (e) {

      console.log("MJ ERROR:", e?.response?.data || e.message);
      message.reply("Failed.");

    }
  }
};