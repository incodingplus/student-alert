import "./setting.js";
import { addQueueSpread } from "./google.js";
import fs from "fs/promises";
import path from "path";
import { channelsArr, dirname, spreadsArr } from "./setting.js";
import {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    Partials,
    TextChannel
} from "discord.js";
import {
    studentAlert,
    command as commandC
} from "./chatinput.js";
import {
    studentJisi,
    command as commandM
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

client.on("ready", async () => {
    console.log('준비 완료');
});

client.on("messageCreate", async (msg) => {
    try {
        if (!channelsArr.includes(msg.channelId)) return;
        if (msg.author.id !== process.env.CLIENT_ID) {
            await msg.delete();
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("이 채널에서는 일반 메세지를 작성할 수 없습니다.");
            const al = await msg.author.send({
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
    let spreadName = '';
    if(!inter?.interaction?.commandName) return;
    if(!commandC.has(inter.interaction.commandName) && !commandM.has(inter.interaction.commandName)) return;
    let command = inter.interaction.commandName;
    if(commandC.has(command)){
        spreadName = spreadsArr[0];
    } else if(commandM.has(command)){
        spreadName = spreadsArr[1];
    } else {
        return;
    }
    await addQueueSpread('del', { id: inter.id, spreadName});
});

client.on("interactionCreate", async (inter) => {
    try {
        if (!inter.isChatInputCommand() && !inter.isMessageContextMenuCommand()) return;
        if (inter.channel.parentId !== process.env.CATEGORY) {
            const embed = new EmbedBuilder();
            embed
                .setColor("Red")
                .setTitle("이 채널에서는 학생 알리미를 사용할 수 없습니다.");
            await inter.reply({ embeds: [embed], ephemeral:true });
            return;
        }
        let bool = await studentAlert(inter, channelsArr[0], spreadsArr[0]);
        if (!bool) bool = await studentJisi(inter, channelsArr[1], spreadsArr[1]);
        if (!bool) bool = await studentContext(inter);
    } catch (err) {
        console.error(err);
        await fs.writeFile(
            path.resolve(dirname, "../logs", `${Date.now()}`),
            typeof err === 'object' ? JSON.stringify(err) : String(err),
            { encoding: "utf-8" }
        );
    }
});

client.login(process.env.TOKEN);
