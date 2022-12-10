import "./setting.js";
import { addQueueSpread } from "./google.js";
import fs from "fs/promises";
import path from "path";
import { dirname } from "./setting.js";
import {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    Partials,
} from "discord.js";
import {
  studentAlert,
  studentJisi,
  studentModal
} from "./inter.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.User, Partials.Reaction, Partials.Message],
});

client.on("ready", () => {
  console.log("테스트 시작!");
});

client.on("messageCreate", async (msg) => {
  try {
    if (msg.channelId !== process.env.CHANNEL && msg.channelId !== process.env.CHANNEL2) return;
    if (msg.author.id !== process.env.CLIENT_ID) {
      await msg.delete();
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("이 채널에서는 일반 메세지를 작성할 수 없습니다.");
      const al = await msg.channel.send({
        embeds: [embed],
      });
      setTimeout(async () => await al.delete(), 3000);
    }
  } catch (err) {
    await fs.writeFile(
      path.resolve(dirname, "../logs", `${Date.now()}`),
      String(err),
      { encoding: "utf-8" }
    );
  }
});

client.on('messageDelete', async inter => {
  await addQueueSpread('del', {id:inter.id});
})

client.on("messageReactionAdd", async (inter) => {
  if (inter.emoji.name !== "😱") return;
  if (inter.message.channelId !== process.env.CHANNEL) return;
  const user = await inter.users.fetch();
  const msg = await inter.message.fetch();
  if (msg.interaction && user.has(msg.interaction.user.id)) {
    // 메세지 삭제
    // msg.id는 해당 메시지의 id 값이 아님. 해당 메시지의 id 값은 msg.interaction.id에 있음.
    await msg.delete();
    await addQueueSpread('del', {id:msg.id});
  }
});

client.on("interactionCreate", async (inter) => {
  try {
    if(!inter.isChatInputCommand() && !inter.isModalSubmit()) return;
    if (inter.channel.parentId !== process.env.CATEGORY) {
      const embed = new EmbedBuilder();
      embed
        .setColor("Red")
        .setTitle("이 채널에서는 학생 알리미를 사용할 수 없습니다.");
      await inter.reply({ embeds: [embed] });
      setTimeout(async () => await inter.deleteReply(), 3000);
      return;
    }
    let bool = await studentAlert(inter);
    if(!bool) bool = await studentJisi(inter);
    if(!bool) bool = await studentModal(inter);
  } catch (err) {
    await fs.writeFile(
      path.resolve(dirname, "../logs", `${Date.now()}`),
      String(err),
      { encoding: "utf-8" }
    );
  }
});

client.login(process.env.TOKEN);
