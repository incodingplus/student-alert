import { 신규, 퇴원, 변경, 보충, 결석, 비대면, 지시 } from './func.js';
import type { CF } from './func.js';
import { 
    CacheType,
    EmbedBuilder,
    Interaction,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
    GuildMember,
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
  
const command2 = new Map<string, CF>([
    ['지시', 지시]
])

export const studentAlert = async (inter:Interaction<CacheType>) => {
    if(!inter.isChatInputCommand()) return false;
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
        id:message.id, type, inputValue
      });
      return true;
    }
    embed.setColor("Red").setTitle(result.value as string);
    await inter.reply({ embeds: [embed] });
    setTimeout(async () => await inter.deleteReply(), 3000);
    return true;
}

export const studentJisi = async (inter:Interaction<CacheType>) => {
    if (!inter.isChatInputCommand()) return false;
    if (!command2.has(inter.commandName)) return false;
    if (inter.channelId !== process.env.CHANNEL2) return false;
    const modal = new ModalBuilder()
        .setCustomId(inter.commandName)
        .setTitle(inter.commandName);

    let member = inter.options.data[0].member as GuildMember;


    const firstInput = new TextInputBuilder()
        .setCustomId('first')
        .setLabel('이름')
        .setValue(member.nickname)
        .setStyle(TextInputStyle.Short);

    const secondInput = new TextInputBuilder()
        .setCustomId('second')
        .setLabel(`지시사항을 써주세요.`)
        .setStyle(TextInputStyle.Paragraph);

    
    const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(firstInput);
    const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(secondInput);

    modal.addComponents(firstRow, secondRow);
    await inter.showModal(modal);
    return true;
}

export const studentModal = async (inter:Interaction<CacheType>) => {
    if(!inter.isModalSubmit()) return false;
    if(!command2.has(inter.customId)) return false;
    if (inter.channelId !== process.env.CHANNEL2) {
      return false;
    }
    console.log(inter);
    const embed = new EmbedBuilder();
    embed
      .setColor('Aqua')
      .setTitle(inter.customId)
      .setDescription(
        inter.fields.getTextInputValue('first')
      );
    await inter.reply({embeds:[embed]});
    return true;
}