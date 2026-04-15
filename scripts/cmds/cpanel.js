const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");
const os = require("os");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

module.exports = {
  config: {
    name: "cpanel",
    version: "3.2",
    author: "ARIFUL",
    countDown: 5,
    role: 0,
    shortDescription: "Pro Panel",
    category: "system"
  },

  onStart: async function ({ api, event }) {

    const width = 1000;
    const height = 600;

    const encoder = new GIFEncoder(width, height);
    const filePath = path.join(__dirname, "panel.gif");

    const stream = encoder.createReadStream();
    stream.pipe(fs.createWriteStream(filePath));

    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(300);
    encoder.setQuality(10);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    function hex(x, y, color, title, value) {
      ctx.beginPath();

      const size = 90;

      for (let i = 0; i < 6; i++) {
        let angle = Math.PI / 3 * i;
        let px = x + size * Math.cos(angle);
        let py = y + size * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 45;
      ctx.shadowColor = color;
      ctx.stroke();

      ctx.shadowBlur = 20;
      ctx.stroke();

      ctx.shadowBlur = 0;

      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";

      ctx.font = "bold 20px Arial";
      ctx.fillText(value, x, y - 5);

      ctx.font = "13px Arial";
      ctx.fillStyle = "#ccc";
      ctx.fillText(title, x, y + 25);
    }

    const totalRAM = (os.totalmem()/1024/1024/1024).toFixed(1);
    const freeRAM = (os.freemem()/1024/1024/1024).toFixed(1);
    const usedRAM = (totalRAM - freeRAM).toFixed(1);
    const ramPercent = ((usedRAM / totalRAM) * 100).toFixed(1);

    const cpuCores = os.cpus().length;

    const botUptimeSec = process.uptime();
    const botHours = Math.floor(botUptimeSec / 3600);
    const botMinutes = Math.floor((botUptimeSec % 3600) / 60);
    const botUptime = `${botHours}h ${botMinutes}m`;

    const sysSec = os.uptime();
    const sysHours = Math.floor(sysSec / 3600);
    const sysDays = Math.floor(sysHours / 24);
    const sysUptime = `${sysDays}d ${sysHours % 24}h`;

    const cpuUsage = (os.loadavg()[0] * 100 / cpuCores).toFixed(1);

    let disk = "N/A";
    try {
      const output = execSync("df -h /").toString();
      const line = output.split("\n")[1];
      disk = line.split(/\s+/)[4];
    } catch {}

    const hostname = os.hostname();

    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString();

    const base = [255, 70, 150];

    for (let f = 0; f < 12; f++) {

      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#050914");
      grad.addColorStop(1, "#0a0f1f");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      let t = Math.sin(f * 0.6);

      let r = base[0];
      let g = base[1] + t * 60;
      let b = base[2] + t * 60;

      let color = `rgb(${r},${g|0},${b|0})`;

      ctx.fillStyle = "#aaa";
      ctx.font = "14px Arial";
      ctx.fillText(`OS: ${os.platform()} (${os.arch()})`, 80, 40);
      ctx.fillText(`${date} ${time}`, 780, 40);

      hex(500, 300, color, "𝐁𝐘 𝐀𝐑𝐈𝐅𝐔𝐋", "𝐗𝐒 𝐏𝐀𝐍𝐄𝐋");

      hex(360, 170, color, "𝐁𝐎𝐓 𝐔𝐏𝐓𝐈𝐌𝐄", botUptime);
      hex(640, 170, color, "𝐂𝐏𝐔 𝐂𝐎𝐑𝐄𝐒", cpuCores + "");

      hex(240, 300, color, "𝐂𝐏𝐔 𝐔𝐒𝐀𝐆𝐄", cpuUsage + "%");
      hex(760, 300, color, "𝐃𝐈𝐒𝐊 𝐔𝐒𝐀𝐆𝐄", disk);

      hex(360, 440, color, "𝐓𝐎𝐓𝐀𝐋 𝐑𝐀𝐌", totalRAM + " GB");
      hex(640, 440, color, "𝐑𝐀𝐌 𝐔𝐒𝐀𝐆𝐄", ramPercent + "%");

      hex(140, 170, color, "𝐒𝐘𝐒 𝐔𝐏𝐓𝐈𝐌𝐄", sysUptime);
      hex(860, 170, color, "𝐇𝐎𝐒𝐓𝐍𝐀𝐌𝐄", hostname);

      encoder.addFrame(ctx);
    }

    encoder.finish();

    stream.on("end", () => {
      api.sendMessage({
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);
    });

  }
};