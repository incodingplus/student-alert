import type { SF } from './func.js';
import { 지시 } from './func.js';
import type {
    Interaction,
    CacheType,
    GuildMember,
} from 'discord.js';
import {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
} from 'discord.js';
const command = new Map<string, SF>([
    ['지시', 지시]
]);


export const studentJisi = async (inter:Interaction<CacheType>) => {
    if (!inter.isChatInputCommand()) return false;
    if (!command.has(inter.commandName)) return false;
    if (inter.channelId !== process.env.CHANNEL2) return false;
    const data = command.get(inter.commandName)();
    const modal = new ModalBuilder()
        .setCustomId(inter.commandName)
        .setTitle(data.title);

    let member = inter.options.data[0].member as GuildMember;

    const embed = new EmbedBuilder();
    embed
        .setColor('Aqua')
        .setTitle(`[${data.title}]`);
    const arr:ActionRowBuilder<TextInputBuilder>[] = [];
    for(let i of data.value){
        const input = new TextInputBuilder()
            .setCustomId(i[0])
            .setLabel(i[1])
            .setStyle(TextInputStyle.Paragraph);
        const act = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
        arr.push(act);
    }

    modal.addComponents(...arr);
    await inter.showModal(modal);
    const modalInter = await inter.awaitModalSubmit({
        filter(e){
            console.log('모달 기다리는 중');
            return true
        },
        time:60000
    });
    const result:[string, string][] = [
        ['이름', member.nickname],
        ...data.value.map(v => [v[1], modalInter.fields.getTextInputValue(v[0])] as [string, string])
    ]
    embed.setDescription(
        result.map((v, i)=> `**${i + 1}. ${v[0]}** : ${v[1]}`).join('\n\n')
    );
    await modalInter.reply({
        embeds:[embed]
    })
    return true;
}