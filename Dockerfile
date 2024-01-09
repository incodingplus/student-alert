FROM oven/bun:latest

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# Git 저장소 복제 스크립트

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "run", "start"]