import './setting.js';
import {
    REST,
    Routes
} from 'discord.js';
const commands = [
    {
        name: '지시',
        description: '지시 사항을 내릴 학생을 적어주세요.',
        options: [
            {
                name: '이름',
                description: '학생 아이디를 선택해주세요.',
                type: 6,
                required: true,
            }
        ]
    }, {
        name: '신규',
        description: '신규 학생 등록 공지',
        options: [
            {
                name: '이름',
                description: '학생 이름을 작성해주세요.',
                type: 3,
                required: true,
            },{
                name: '일시',
                description: "'MM-DD-HH' 또는 'MM-DD-HH:mm' 이런 형식으로 날짜를 작성해주세요.",
                type: 3,
                required: true,
            },{
                name: '학년',
                description: '학생의 학년을 작성해주세요.',
                type: 3,
                required: true,
            },{
                name: '과목',
                description: '과목명을 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '특이사항',
                description: '특이사항이 있다면 작성해주세요.',
                type: 3,
            }
        ]
    }, {
        name: '상담',
        description: '학생 상담 내용 공지',
        options: [
            {
                name: '아이디',
                description: '학생 아이디를 선택해주세요.',
                type: 6,
                required: true,
            }, {
                name: '일시',
                description: "'MM-DD' 이런 형식으로 날짜를 작성해주세요.",
                type: 3,
                required: true,
            }, {
                name: '내용',
                description: '상담 내용을 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '이름',
                description: '필요한 경우 이름을 작성해주세요.',
                type: 3,
            }
        ]
    }, {
        name: '퇴원',
        description: '퇴원 학생 공지',
        options: [
            {
                name: '아이디',
                description: '학생 아이디를 선택해주세요.',
                type: 6,
                required: true,
            }, {
                name: '일시',
                description: "'MM-DD' 이런 형식으로 날짜를 작성해주세요.",
                type: 3,
                required: true,
            }, {
                name: '과목',
                description: '과목명을 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '사유',
                description: '퇴원 사유를 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '이름',
                description: '필요한 경우 이름을 작성해주세요.',
                type: 3,
            }
        ]
    }, {
        name: '변경',
        description: '수업 변경 공지',
        options: [
            {
                name: '아이디',
                description: '학생 아이디를 선택해주세요.',
                type: 6,
                required: true,
            }, {
                name: '기존일시',
                description: "'MM-DD-HH' 또는 'MM-DD-HH:mm' 이런 형식으로 날짜를 작성해주세요.",
                type: 3,
                required: true,
            }, {
                name: '변경일시',
                description: "'MM-DD-HH' 또는 'MM-DD-HH:mm' 이런 형식으로 날짜를 작성해주세요.",
                type: 3,
                required: true,
            }, {
                name: '과목',
                description: '과목명을 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '사유',
                description: '수업 변경 사유를 작성해주세요.',
                required: true,
                type: 3,
            }, {
                name: '이름',
                description: '필요한 경우 이름을 작성해주세요.',
                type: 3,
            }
        ]
    }, {
        name: '보충',
        description: '보충 수업 공지',
        options: [
            {
                name: '아이디',
                description: '학생 아이디를 선택해주세요.',
                type: 6,
                required: true,
            }, {
                name: '일시',
                description: "'MM-DD-HH' 또는 'MM-DD-HH:mm' 이런 형식으로 날짜를 작성해주세요.",
                type: 3,
                required: true,
            }, {
                name: '과목',
                description: '과목명을 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '특이사항',
                description: '특이사항이 있다면 작성해주세요.',
                type: 3,
            }, {
                name: '이름',
                description: '필요한 경우 이름을 작성해주세요.',
                type: 3,
            }
        ]
    }, {
        name: '예약',
        description: '학생 상담 예약',
        options: [
            {
                name: '이름',
                description: '학생 이름을 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '일시',
                description: "'MM-DD-HH' 또는 'MM-DD-HH:mm' 이런 형식으로 날짜를 작성해주세요.",
                type: 3,
                required: true,
            },{
                name: '학년',
                description: '학생의 학년을 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '특이사항',
                description: '특이사항이 있다면 작성해주세요.',
                type: 3,
            }
        ]
    },{
        name: '기록',
        description: '학생 상담 기록',
        options: [
            {
                name: '이름',
                description: '학생 이름을 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '일시',
                description: "'MM-DD-HH' 또는 'MM-DD-HH:mm' 이런 형식으로 날짜를 작성해주세요.",
                type: 3,
                required: true,
            },{
                name: '학년',
                description: '학생의 학년을 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '내용',
                description: '상담 내용을 작성해주세요.',
                type: 3,
                required: true,
            }
        ]
    }, {
        name: '결석',
        description: '결석 학생 공지',
        options: [
            {
                name: '아이디',
                description: '학생 아이디를 선택해주세요.',
                type: 6,
                required: true,
            }, {
                name: '일시',
                description: "'MM-DD-HH' 또는 'MM-DD-HH:mm' 이런 형식으로 날짜를 작성해주세요.",
                type: 3,
                required: true,
            }, {
                name: '과목',
                description: '과목명을 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '사유',
                description: '결석 사유를 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '이름',
                description: '필요한 경우 이름을 작성해주세요.',
                type: 3,
            }
        ]
    }, {
        name: '비대면',
        description: '비대면 수업 학생 공지',
        options: [
            {
                name: '아이디',
                description: '학생 아이디를 선택해주세요.',
                type: 6,
                required: true,
            }, {
                name: '일시',
                description: "'MM-DD-HH' 또는 'MM-DD-HH:mm' 이런 형식으로 날짜를 작성해주세요.",
                type: 3,
                required: true,
            }, {
                name: '과목',
                description: '과목명을 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '사유',
                description: '비대면 수업 사유를 작성해주세요.',
                type: 3,
                required: true,
            }, {
                name: '이름',
                description: '필요한 경우 이름을 작성해주세요.',
                type: 3,
            }
        ]
    }, {
        name: '메세지 삭제',
        type: 3,
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN as string);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        let test = await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID as string, process.env.GUILD as string), { body: commands });
        console.log(test)
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();