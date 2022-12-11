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
        .setColor(data.color)
        .setTitle(`[${data.title}]`);
    const arr:ActionRowBuilder<TextInputBuilder>[] = [];
    for(let i of data.value){
        const input = new TextInputBuilder()
            .setCustomId(i.id)
            .setLabel(i.label)
            .setStyle(TextInputStyle.Paragraph);
        if(i.value){
            input.setValue(i.value());
        }
        const act = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
        arr.push(act);
    }

    modal.addComponents(...arr);
    await inter.showModal(modal);
    const modalInter = await inter.awaitModalSubmit({
        filter(e){
            for(let i of data.value){
                if(!i.check) continue;
                const value = e.fields.getTextInputValue(i.id);
                const ch = i.check(value);
                if(!ch.status) return false;
            }
            return true
        },
        time:60000,
    });
    const result:[string, string][] = [
        ['이름', member.nickname],
        ...data.value.map(v => {
            let val = modalInter.fields.getTextInputValue(v.id);
            if(v.check){
                val = v.check(val).value;
            }
            return [v.view, val] as [string, string]
        })
    ]
    embed.setDescription(
        result.map((v, i)=> `**${i + 1}. ${v[0]}** : ${v[1]}`).join('\n\n')
    );
    await modalInter.reply({
        embeds:[embed]
    })
    return true;
}