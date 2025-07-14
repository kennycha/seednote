# Seednote

비동기적으로 아이디어를 발전시키는 AI 노트 앱

주제만 던지면, 로컬 LLM이 알아서 what, how, why를 작성해줍니다.

## Features

- 주제 입력만으로 아이디어를 why, how, what으로 구조화

- LLM은 로컬에서 실행됨 (Ollama 기반)

- Supabase를 통한 상태 관리 및 저장

## Requirements

- Node.js

- Rust + Cargo

- Supabase 프로젝트

- Ollama 설치 및 모델 다운로드

## Folder Structure

```bash
apps/
  web/    # React(Vite)
  worker/      # Rust LLM 백그라운드 처리기
supabase/
  schema.sql   # DB 테이블 정의
```

## Setup

```bash
# 1. Supabase
# Supabase 콘솔에서 테이블을 만들거나, schema.sql 실행

# 2. Frontend
cd apps/frontend
cp .env.example .env      # 환경변수 설정
npm install
npm run dev

# 3. Worker
cd apps/worker
cp .env.example .env      # 환경변수 설정
cargo run

# 4. LLM 실행
ollama run <model>
```

## License

MIT
