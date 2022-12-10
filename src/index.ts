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
} from "./chatinput.js";
import {
    studentJisi,
} from './modalinput.js';
import {
    studentContext
} from './contextmenu.js'


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
    await addQueueSpread('del', { id: inter.id });
});

client.on("interactionCreate", async (inter) => {
    try {
        if (!inter.isChatInputCommand() && !inter.isModalSubmit() && !inter.isMessageContextMenuCommand()) return;
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
        if (!bool) bool = await studentJisi(inter);
        if (!bool) bool = await studentContext(inter);
    } catch (err) {
        await fs.writeFile(
            path.resolve(dirname, "../logs", `${Date.now()}`),
            String(err),
            { encoding: "utf-8" }
        );
    }
});

client.login(process.env.TOKEN);
