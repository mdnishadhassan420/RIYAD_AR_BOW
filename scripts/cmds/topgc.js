const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { createCanvas, loadImage } = require("canvas");

const MONGO_URI = "mongodb+srv://ariful:ariful900@ariful.hpgg9rh.mongodb.net/topgc";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const groupSchema = new mongoose.Schema({
  threadID: String,
  count: Number
});

const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);

const cachePath = path.join(__dirname, "cache");
if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

// ⚡ NUMBER FORMAT
function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num;
}

// ⚡ FAST IMAGE LOAD
async function loadFast(url) {
  try {
    return await loadImage(url);
  } catch {
    return await loadImage("https://i.imgur.com/2yaf2wb.png");
  }
}

// ⚡ SAFE THREAD INFO
async function getThreadInfoSafe(api, threadID) {
  try {
    const info = await api.getThreadInfo(threadID);
    return {
      name: info.threadName || "Unknown Group",
      image: info.imageSrc || null
    };
  } catch {
    return {
      name: "Unknown Group",
      image: null
    };
  }
}

// UI
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

module.exports = {
  config: {
    name: "topgc",
    version: "34.0",
    author: "S AY EM",
    countDown: 5,
    role: 0,
    shortDescription: "Top Groups Ranking",
    category: "group"
  },

  onChat: async function ({ event }) {
    try {
      if (!event.isGroup) return;

      let data = await Group.findOne({ threadID: event.threadID });

      if (!data) {
        await Group.create({ threadID: event.threadID, count: 1 });
      } else {
        data.count++;
        await data.save();
      }

    } catch {}
  },

  onStart: async function ({ api, event, threadsData }) {
    try {

      api.setMessageReaction("😘", event.messageID, () => {}, true);

      const [dbData, allThreads] = await Promise.all([
        Group.find({}),
        threadsData.getAll()
      ]);

      let countMap = {};
      dbData.forEach(d => countMap[d.threadID] = d.count);

      let groups = allThreads.filter(t => t.isGroup);

      let list = await Promise.all(groups.map(async g => {
        let info = await getThreadInfoSafe(api, g.threadID);
        return {
          name: info.name,
          id: g.threadID,
          image: info.image,
          count: countMap[g.threadID] || 0
        };
      }));

      list = list.sort((a, b) => b.count - a.count).slice(0, 10);

      const canvas = createCanvas(900, 1600);
      const ctx = canvas.getContext("2d");

      let bg = ctx.createLinearGradient(0, 0, 0, 1600);
      bg.addColorStop(0, "#0f172a");
      bg.addColorStop(1, "#020617");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 45px sans-serif";
      ctx.fillText("🏆 TOP THREADS/GROUPS", 120, 70);

      ctx.font = "18px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Ranking #1 - #10", 340, 110);

      let y = 150;

      const colors = [
        "#FFD700","#C0C0C0","#CD7F32",
        "#00D1FF","#00FFA3","#A855F7",
        "#A855F7","#A855F7","#A855F7","#A855F7"
      ];

      const avatars = await Promise.all(list.map(d => {
        if (d.image) return loadFast(d.image);
        return loadFast(`https://graph.facebook.com/${d.id}/picture?width=720&height=720`);
      }));

      for (let i = 0; i < list.length; i++) {
        let data = list[i];

        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 3;

        roundRect(ctx, 70, y, 760, 100, 20);
        ctx.fillStyle = "#1e293b";
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(50, y + 50, 22, 0, Math.PI * 2);
        ctx.fillStyle = colors[i];
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(`${i+1}`, 44, y + 55);

        ctx.save();
        ctx.beginPath();
        ctx.arc(150, y + 50, 32, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatars[i], 118, y + 18, 64, 64);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(150, y + 50, 34, 0, Math.PI * 2);
        ctx.strokeStyle = colors[i];
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 24px sans-serif";

        let name = data.name.length > 28 ? data.name.slice(0, 28) + "..." : data.name;
        ctx.fillText(name, 220, y + 55);

        let msg = formatNumber(data.count);

        roundRect(ctx, 650, y + 25, 140, 50, 10);
        ctx.fillStyle = "#020617";
        ctx.fill();
        ctx.strokeStyle = colors[i];
        ctx.stroke();

        ctx.fillStyle = colors[i];
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(msg, 670, y + 58);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "13px sans-serif";
        ctx.fillText("MESSAGES", 670, y + 40);

        y += 120;
      }

      const imgPath = path.join(cachePath, "topgc_fast.png");
      fs.writeFileSync(imgPath, canvas.toBuffer());

      // ✅ ONLY IMAGE SEND
      api.sendMessage({
        attachment: fs.createReadStream(imgPath)
      }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);

    } catch (e) {
      console.log(e);
      api.sendMessage("❌ Error generating image!", event.threadID);
    }
  }
};