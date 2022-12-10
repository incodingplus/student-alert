import { 신규, 퇴원, 변경, 보충, 결석, 비대면 } from './func.js';
import type { CF } from './func.js';
import type {
    CacheType,
    Interaction,
} from 'discord.js';
import {
    EmbedBuilder,
} from 'discord.js';
import { addQueueSpread } from "./google.js";

const command = new Map<string, CF>([
    ["신규", 신규],
    ["퇴원", 퇴원],
    ["변경", 변경],
    ["보충", 보충],
    ["결석", 결석],
    ["비대면", 비대면],
]);



export const studentAlert = async (inter: Interaction<CacheType>) => {
    if (!inter.isChatInputCommand()) return false;
    if (!command.has(inter.commandName)) return false; //inter의 commandName이 command에서 정의한 타입에 포함되지 않으면 종료
    if (inter.channelId !== process.env.CHANNEL) return false;
    const embed = new EmbedBuilder();
    const result = command.get(inter.commandName)(inter.options.data);
    if (result.status) {
        const type = result.title;
        const inputValue = result.value;

        // 메세지 등록
        embed
            .setColor(result.color)
            .setTitle(`[${result.title}]`)
            .setDescription(
                result.value
                    .map((v, i) => `**${i + 1}. ${v[0]} : **${v[1]}`)
                    .join("\n\n")
            );
        await inter.reply({ embeds: [embed] });
        const message = await inter.fetchReply();
        await addQueueSpread('add', {
            id: message.id, type, inputValue
        });
        return true;
    }
    embed.setColor("Red").setTitle(result.value as string);
    await inter.reply({ embeds: [embed] });
    setTimeout(async () => await inter.deleteReply(), 3000);
    return true;
}