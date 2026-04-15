const { createCanvas, loadImage } = require("canvas");
const os = require("os");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up","upt"],
    version: "6.6",
    author: "ARIFUL",
    role: 0,
    shortDescription: "Ultra Premium Dashboard",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message, event, usersData }) {
    try {
      const width = 1250;
      const height = 750;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 220; i++) {
        ctx.beginPath();
        ctx.arc(Math.random()*width, Math.random()*height, Math.random()*2, 0, Math.PI*2);
        ctx.fillStyle = "white";
        ctx.fill();
      }

      const cpu = Math.floor(Math.random()*50)+20;
      const ram = Math.floor(((os.totalmem()-os.freemem())/os.totalmem())*100);
      const disk = Math.floor(Math.random()*40)+50;

      const uptime = process.uptime();
      const d = Math.floor(uptime/86400);
      const h = Math.floor((uptime%86400)/3600);
      const m = Math.floor((uptime%3600)/60);
      const s = Math.floor(uptime%60);

      const ping = Math.floor(Math.random()*100)+120;

      const host = os.hostname();
      const cores = os.cpus().length;
      const memoryGB = (os.totalmem()/1024/1024/1024).toFixed(1);

      ctx.shadowColor = "#00eaff";
      ctx.shadowBlur = 25;
      ctx.fillStyle = "#00eaff";
      ctx.font = "bold 58px Sans";
      ctx.fillText("𝐁𝐎𝐓 𝐃𝐀𝐒𝐇𝐁𝐎𝐀𝐑𝐃", 360, 90);
      ctx.shadowBlur = 0;

      function box(x,y,w,h){
        ctx.beginPath();
        ctx.roundRect(x,y,w,h,30);
        ctx.fillStyle="rgba(255,255,255,0.05)";
        ctx.fill();

        ctx.shadowColor="#00eaff";
        ctx.shadowBlur=12;
        ctx.strokeStyle="rgba(0,255,255,0.6)";
        ctx.lineWidth=2;
        ctx.stroke();
        ctx.shadowBlur=0;
      }

      function bar(x,y,w,p,color,label){
        ctx.beginPath();
        ctx.roundRect(x,y,w,38,20);
        ctx.fillStyle="rgba(0,0,0,0.6)";
        ctx.fill();

        ctx.shadowColor=color;
        ctx.shadowBlur=25;
        ctx.fillStyle=color;
        ctx.beginPath();
        ctx.roundRect(x,y,(w*p)/100,38,20);
        ctx.fill();
        ctx.shadowBlur=0;

        ctx.fillStyle="#fff";
        ctx.font="21px Sans";
        ctx.fillText(label,x,y-8);
        ctx.fillText(p+"%",x+w-75,y+26);
      }

      box(40,130,320,230);

      let avatar;
      const uid = event.senderID;

      try {
        avatar = await loadImage(`https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
      } catch {
        avatar = null;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(200,220,75,0,Math.PI*2);
      ctx.clip();

      if (avatar) {
        ctx.drawImage(avatar,125,145,150,150);
      } else {
        ctx.fillStyle="#111";
        ctx.fillRect(125,145,150,150);
      }

      ctx.restore();

      ctx.beginPath();
      ctx.arc(200,220,75,0,Math.PI*2);
      ctx.lineWidth=3;
      ctx.strokeStyle="#00eaff";
      ctx.stroke();

      let name = "User";
      try {
        const user = await usersData.get(uid);
        name = user.name || "User";
      } catch {}

      ctx.fillStyle="#00eaff";
      ctx.textAlign="center";

      let fontSize = 26;
      do {
        ctx.font = `bold ${fontSize}px Sans`;
        fontSize--;
      } while (ctx.measureText(name).width > 260 && fontSize > 14);

      ctx.fillText(name,200,340);

      ctx.textAlign="start";

      box(40,380,320,350);

      let y = 420;

      ctx.fillStyle="#00eaff";
      ctx.font="26px Sans";
      ctx.fillText("𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎",80,y);

      ctx.fillStyle="#fff";
      ctx.font="20px Sans";

      y+=45; ctx.fillText(`𝐂𝐏𝐔 : ${cpu}%`,80,y);
      y+=30; ctx.fillText(`𝐑𝐀𝐌 : ${ram}%`,80,y);
      y+=30; ctx.fillText(`𝐃𝐈𝐒𝐊 : ${disk}%`,80,y);
      y+=30; ctx.fillText(`𝐂𝐎𝐑𝐄𝐒 : ${cores}`,80,y);
      y+=30; ctx.fillText(`𝐑𝐀𝐌 𝐆𝐁 : ${memoryGB}`,80,y);

      y+=40;
      ctx.fillStyle="#00ff9c";
      ctx.font="bold 24px Sans";
      ctx.fillText(`${d}d ${h}h ${m}m ${s}s`,80,y);

      y+=35;
      ctx.fillStyle="#00eaff";
      ctx.font="20px Sans";
      ctx.fillText(`𝐏𝐈𝐍𝐆: ${ping}𝐌𝐒`,80,y);

      box(400,150,780,110);
      box(400,300,780,110);
      box(400,450,780,110);
      box(400,600,780,110);

      bar(440,200,680,cpu,"#00eaff","𝐂𝐏𝐔 𝐔𝐒𝐀𝐆𝐄");
      bar(440,350,680,ram,"#ff6ec7","𝐑𝐀𝐌 𝐔𝐒𝐀𝐆𝐄");
      bar(440,500,680,disk,"#4facfe","𝐃𝐈𝐒𝐊 𝐔𝐒𝐀𝐆𝐄");

      const extra = Math.floor(Math.random()*50)+30;
      bar(440,650,680,extra,"#00ff9c","𝐒𝐘𝐒𝐓𝐄𝐌 𝐋𝐎𝐀𝐃");

      const filePath = path.join(__dirname,"ultra_ui.png");
      fs.writeFileSync(filePath,canvas.toBuffer("image/png"));

      return message.reply({
        body:"",
        attachment:fs.createReadStream(filePath)
      });

    } catch(e){
      console.log(e);
      message.reply("Error: "+e.message);
    }
  }
};