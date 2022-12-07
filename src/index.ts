import './setting.js';
import './google.js';
import fs from 'fs/promises';
import path from 'path';
import { dirname } from './setting.js';
import { Client, GatewayIntentBits, EmbedBuilder, Partials } from 'discord.js';
import type { CF } from './func.js';
import { 신규, 퇴원, 변경, 보충, 결석, 비대면 } from './func.js';

const command = new Map<string,CF>([
    ['신규', 신규],
    ['퇴원', 퇴원],
    ['변경', 변경],
    ['보충', 보충],
    ['결석', 결석],
    ['비대면', 비대면],
])
const client = new Client({
    intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
    partials:[Partials.User, Partials.Reaction, Partials.Message]
});

client.on('ready', () => {
    console.log('테스트 시작!');
});

client.on('messageCreate', async msg => {
    try{
        if(msg.channelId !== process.env.CHANNEL) return;
        if(msg.author.id !== process.env.CLIENT_ID) {
            await msg.delete();
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('이 채널에서는 일반 메세지를 작성할 수 없습니다.');
            const al = await msg.channel.send({
                embeds:[embed]
            });
            setTimeout(async () => await al.delete(), 3000);
        }
    } catch(err){
        await fs.writeFile(path.resolve(dirname, '../logs', `${Date.now()}`), String(err), {encoding:'utf-8'});
    }
});

client.on('messageReactionAdd', async inter => {
    if(inter.emoji.name !== '😱') return;
    if(inter.message.channelId !== process.env.CHANNEL) return;
    const user = await inter.users.fetch();
    const msg = await inter.message.fetch();
    if(msg.interaction && user.has(msg.interaction.user.id)){
        await msg.delete();
    }
})

client.on('interactionCreate', async inter => {
    try{
        if(!inter.isChatInputCommand()) return;
        if(!command.has(inter.commandName)) return;
        const embed = new EmbedBuilder();
        if(inter.channel.parentId !== process.env.CATEGORY){
            embed.setColor('Red')
                .setTitle('이 채널에서는 학생 알리미를 사용할 수 없습니다.');
            await inter.reply({embeds:[embed]});
            setTimeout(async () => await inter.deleteReply(), 3000);
        }
        if(inter.channelId !== process.env.CHANNEL) {
            return;
        }
        const result = command.get(inter.commandName)(inter.options.data);
        if(result.status){
            embed.setColor(result.color)
                .setTitle(`[${result.title}]`)
                .setDescription(result.value.map((v, i) => `**${i + 1}. ${v[0]} : **${v[1]}`).join('\n\n'))
            await inter.reply({embeds:[embed]});
            return;
        }
        embed.setColor('Red')
            .setTitle(result.value as string)
        await inter.reply({embeds:[embed]});
        setTimeout(async () => await inter.deleteReply(), 3000);
    } catch(err){
        await fs.writeFile(path.resolve(dirname, '../logs', `${Date.now()}`), String(err), {encoding:'utf-8'});
    }
});

client.login(process.env.TOKEN);