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
import { addQueueSpread } from './google.js';

export const command = new Map<string, SF>([
    ['지시', 지시]
]);


export const studentJisi = async (inter:Interaction<CacheType>, channel:string, spreadName:string) => {
    if (!inter.isChatInputCommand()) return false;
    if (!command.has(inter.commandName)) return false;
    if (inter.channelId !== channel) return false;
    const reg = /^([가-힣]+)\d{5}$/;
    const tReg = /^([가-힣]+)\s선생님/;
    const data = command.get(inter.commandName)();
    const modal = new ModalBuilder()
        .setCustomId(inter.commandName)
        .setTitle(data.title);

    let member = inter.options.data[0].member as GuildMember;
    let tMember = inter.member as GuildMember;
    const embed = new EmbedBuilder();
    let user = reg.test(member.nickname) ? member.nickname : member.user.username;
    let teacher = tReg.test(tMember.nickname) ? tMember.nickname : tMember.user.username;
    if(!teacher || !user){
        embed.setColor('Red')
        if(!teacher){
            embed.setTitle('선생님만 메세지를 보낼 수 있습니다.');
        } else {
            embed.setTitle("이 유저는 적절한 학생이 아닙니다.");
        }
        await inter.reply({ embeds: [embed], ephemeral:true });
        return;
    }
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
    inter.showModal(modal);
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
        ['이름', user.match(reg)[1]],
        ['선생님', teacher.match(tReg)[1]],
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
    });
    const message = await modalInter.fetchReply();
    await addQueueSpread('add', {
        id: message.id, type:inter.commandName, inputValue:[['아이디', user],...result], spreadName
    });
    return true;
}