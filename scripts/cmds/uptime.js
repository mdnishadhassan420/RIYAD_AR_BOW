const os = require("os");
const moment = require("moment");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "up"],
    version: "4.1",
    author: "S AY EM",
    countDown: 5,
    role: 0,
    shortDescription: "Premium uptime image",
  },

  onStart: async function ({ message, event }) {
    try {
      const uptime = process.uptime();
      const h = Math.floor(uptime / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      const s = Math.floor(uptime % 60);

      const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
      const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
      const ping = Date.now() - event.timestamp;

      const canvas = createCanvas(900, 450);
      const ctx = canvas.getContext("2d");

      const bgGradient = ctx.createLinearGradient(0, 0, 900, 450);
      bgGradient.addColorStop(0, "#001a4d");
      bgGradient.addColorStop(1, "#002266");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cardGradient = ctx.createLinearGradient(80, 60, 820, 390);
      cardGradient.addColorStop(0, "#0a2a66");
      cardGradient.addColorStop(1, "#001a4d");
      ctx.fillStyle = cardGradient;
      ctx.roundRect(80, 60, 740, 330, 20);
      ctx.fill();

      ctx.strokeStyle = "#00c3ff";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#00c3ff";
      ctx.shadowBlur = 25;
      ctx.stroke();

      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00ffff";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px Sans";
      ctx.fillText("BOT STATUS", 310, 110);

      ctx.shadowColor = "#00c3ff";
      ctx.shadowBlur = 8;
      ctx.font = "26px Sans";
      ctx.fillStyle = "#ffffff";

      ctx.fillText(`⏱ UPTIME: ${h}h ${m}m ${s}s`, 150, 180);
      ctx.fillText(`⚡ PING: ${ping} ms`, 150, 220);
      ctx.fillText(`💾 RAM: ${freeMem}/${totalMem} MB`, 150, 260);
      ctx.fillText(`🧠 CPU: ${os.cpus().length} cores`, 150, 300);
      ctx.fillText(`📅 ${moment().format("HH:mm:ss")}`, 150, 340);

      const filePath = path.join(__dirname, "cache", `uptime_${Date.now()}.png`);
      fs.ensureDirSync(path.dirname(filePath));
      fs.writeFileSync(filePath, canvas.toBuffer());

      await message.reply({
        body: "",
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.log(err);
      message.reply("❌ Error generating uptime image");
    }
  }
};