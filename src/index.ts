import "./setting.js";
import { QueueType, addQueueSpread } from "./google.js";
import path from "path";
import { CHANNELS, dirname, SPREADS, CONSTRAINTS } from "./setting.js";
import {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    Partials,
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
import { Serve } from "bun";
import { verifySignature } from "./hook.js";

console.log('버전 1.0.3')

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
    const todo = Bun.file(path.resolve(dirname, '../logs/todo.json'))
    if (await todo.exists()) {
        const json = await todo.json<[string, QueueType][]>();
        for (let i of json) {
            await addQueueSpread(...i);
        }
    } else {
        console.log('todo 없음')
    }
});

client.on("messageCreate", async (msg) => {
    try {
        if (!CONSTRAINTS.includes(msg.channelId)) return;
        if (msg.author.id !== Bun.env.HAN_CLIENT_ID) {
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
        await Bun.write(path.resolve(dirname, "../logs", `${Date.now()}`), String(err))
    }
});

client.on('messageDelete', async inter => {
    let spreadName = '';
    if (!inter?.interaction?.commandName) return;
    if (!commandC.has(inter.interaction.commandName) && !commandM.has(inter.interaction.commandName)) return;
    let command = inter.interaction.commandName;
    if (commandC.has(command)) {
        spreadName = SPREADS.DATA;
    } else if (commandM.has(command)) {
        spreadName = SPREADS.JISI;
    } else {
        return;
    }
    await addQueueSpread('del', { id: inter.id, spreadName });
});

client.on("interactionCreate", async (inter) => {
    try {
        if (!inter.isChatInputCommand() && !inter.isMessageContextMenuCommand()) return;
        //@ts-ignore
        if (inter?.channel?.parentId !== Bun.env.HAN_CATEGORY) {
            const embed = new EmbedBuilder();
            embed
                .setColor("Red")
                .setTitle("이 채널에서는 학생 알리미를 사용할 수 없습니다.");
            await inter.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        let bool = await studentAlert(inter, SPREADS.DATA);
        if (!bool) bool = (await studentJisi(inter, CHANNELS.JISI, SPREADS.JISI)) ?? false;
        if (!bool) bool = (await studentContext(inter)) ?? false;
    } catch (err) {
        console.error(err);
        await Bun.write(
            path.resolve(dirname, "../logs", `${Date.now()}`),
            typeof err === 'object' ? JSON.stringify(err) : String(err)
        )
    }
});

client.login(Bun.env.HAN_TOKEN);

const serve: Serve<unknown> = {
    port: Bun.env.HAN_PORT ?? '4500',
    hostname: '0.0.0.0',
    fetch(request) {
        const url = new URL(request.url);
        if (url.pathname === '/hook' && request.method === 'POST') {
            return verifySignature(request)
        }
        return new Response('404 not found', {
            status: 404
        });
    },
    error(req) {
        Bun.write(`./logs/${Date.now()}`, String(req));
        return new Response(JSON.stringify({ status: "bad", err: req.message }));
    },
}
export default serve