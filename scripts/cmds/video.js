const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
config: {
name: "video",
version: "2.2.0",
author: "milon",
countDown: 5,
role: 0,
shortDescription: "Get YouTube video by name (No Prefix)",
longDescription: "Search and download YouTube videos by name without any prefix",
category: "media",
guide: {
en: "video <name>"
}
},

// এই ফাংশনটি প্রিফিক্স ছাড়া কাজ করতে সাহায্য করবে
onChat: async function ({ api, event, message }) {
const { body, threadID, messageID } = event;
if (!body || !body.toLowerCase().startsWith("video ")) return;

const args = body.split(/\s+/);
args.shift(); // 'video' লেখাটি বাদ দিয়ে বাকিটা কুয়েরি হিসেবে নিবে
const query = args.join(" ");

if (!query) return;

let loadingMsgID = null;

try {
const loading = await api.sendMessage(`🔎 Searching for "${query}"...\n⏳ Please wait...`, threadID);
loadingMsgID = loading.messageID;

const searchRes = await axios.get(`https://betadash-search-download.vercel.app/yt?search=${encodeURIComponent(query)}`);
const video = searchRes.data[0];

if (!video || !video.url) throw new Error("No video found.");

try { await api.unsendMessage(loadingMsgID); } catch(e) {}

const downloading = await api.sendMessage(`🎬 Found: ${video.title}\n⬇️ Downloading now...`, threadID);
loadingMsgID = downloading.messageID;

const dlRes = await axios.get(`https://yt-api-imran.vercel.app/api?url=${video.url}`);
const downloadUrl = dlRes.data.downloadUrl;
if (!downloadUrl) throw new Error("No download link received.");

const videoBuffer = (await axios.get(downloadUrl, { responseType: 'arraybuffer' })).data;
const cachePath = path.join(__dirname, "cache");
await fs.ensureDir(cachePath);
const filePath = path.join(cachePath, `video_${Date.now()}.mp4`);
await fs.writeFile(filePath, videoBuffer);

const finalMessage = {
body: `━━━━━━━━━━━━━━━━━━\n🎬 𝗧𝗶𝘁𝗹𝗲: ${video.title}\n⏱️ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${video.time}\n━━━━━━━━━━━━━━━━━━\n\n✅ Your video is ready!`,
attachment: fs.createReadStream(filePath)
};

await api.sendMessage(finalMessage, threadID, async () => {
if (fs.existsSync(filePath)) await fs.unlinkSync(filePath);
}, messageID);

if (loadingMsgID) await api.unsendMessage(loadingMsgID);

} catch (err) {
if (loadingMsgID) try { await api.unsendMessage(loadingMsgID); } catch (e) {}
api.sendMessage(`❌ Error: ${err.message || "Something went wrong!"}`, threadID, messageID);
}
},

// এটি খালি রাখা হয়েছে যাতে help লিস্টে কমান্ডটি দেখায়
onStart: async function ({ api, event }) {
api.sendMessage("অনুগ্রহ করে 'video <নাম>' এভাবে লিখে ভিডিও সার্চ করুন (কোনো প্রিফিক্স লাগবে না)।", event.threadID, event.messageID);
}
};