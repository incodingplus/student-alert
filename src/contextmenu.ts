import type { CF } from './func';
import { 삭제 } from './func';
import { CHANNELS } from './setting';
import type {
    Interaction,
    CacheType,
} from 'discord.js';
import {
    EmbedBuilder
} from 'discord.js';
const command = new Map<string, CF>([
    ['메세지 삭제', 삭제]
]);

export const studentContext = async (inter:Interaction<CacheType>) => {
    if(!inter.isMessageContextMenuCommand()) return;
    if (!command.has(inter.commandName)) return false;
    if (!Object.values(CHANNELS).includes(inter.channelId)) return false;
    if(!inter.targetMessage.interaction) return false;
    const embed = new EmbedBuilder();
    if(inter.user.id === inter.targetMessage.interaction.user.id){
        await inter.targetMessage.delete();
        embed
            .setColor("Blue")
            .setTitle(`'${inter.targetId}'를 성공적으로 삭제했습니다.`);
    } else {
        embed
            .setColor("Red")
            .setTitle("이 메세지를 만든 유저가 아니라서 삭제할 수 없습니다.");
    }
    await inter.reply({ embeds: [embed], ephemeral:true });
    return;
}