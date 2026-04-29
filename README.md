# 🎯 tang-ty — Discord Party Bot (discord.js)

บอทสำหรับรวมกลุ่มกิจกรรมบน Discord | Built with discord.js v14

## Slash Commands

| Command | คำอธิบาย |
|---------|----------|
| `/tangty` | สร้างปาร์ตี้ใหม่ (เปิด Modal) |
| `/tangty-list` | ดูรายการปาร์ตี้ที่เปิดอยู่ |
| `/tangty-info <id>` | ดูรายละเอียดด้วย Party ID |

## ปุ่มในปาร์ตี้

| ปุ่ม | ใครกดได้ |
|------|---------|
| ✅ เข้าร่วม | ทุกคน |
| 🚪 ออกจากปาร์ตี้ | สมาชิก (ยกเว้นหัวหน้า) |
| 🔒 ปิดรับสมาชิก | หัวหน้าปาร์ตี้ |
| 🔓 เปิดรับสมาชิก | หัวหน้าปาร์ตี้ |
| ❌ ยกเลิกปาร์ตี้ | หัวหน้าปาร์ตี้ |

## วิธีติดตั้ง

### 1. สร้าง Discord Bot

1. ไปที่ [Discord Developer Portal](https://discord.com/developers/applications)
2. สร้าง Application → ไปที่ **Bot**
3. เปิด **Server Members Intent** และ **Message Content Intent**
4. คัดลอก **Token** และ **Application ID (Client ID)**
5. **OAuth2 → URL Generator**: เลือก `bot` + `applications.commands`
6. Bot Permissions: `Send Messages`, `Embed Links`, `Read Message History`
7. เชิญบอทเข้าเซิร์ฟเวอร์

### 2. ตั้งค่า

```bash
cp .env.example .env
nano .env   # ใส่ DISCORD_TOKEN และ CLIENT_ID
```

### 3. Register Slash Commands (ทำครั้งแรกครั้งเดียว)

```bash
# Local
npm install
node src/deploy-commands.js

# หรือผ่าน Docker
docker compose run --rm tang-ty node src/deploy-commands.js
```

### 4. Deploy บน Raspberry Pi 5

```bash
docker compose up -d --build
docker compose logs -f
```

### Portainer

1. Stacks → Add stack → อัปโหลด `docker-compose.yaml`
2. ใส่ Environment: `DISCORD_TOKEN`, `CLIENT_ID`
3. Deploy

## โครงสร้างโปรเจกต์

```
tang-ty-js/
├── src/
│   ├── index.js                  # Entry point
│   ├── deploy-commands.js        # Register slash commands
│   ├── commands/
│   │   ├── party.js              # /party command + Modal
│   │   └── party-list-info.js   # /party-list, /party-info
│   ├── events/
│   │   ├── ready.js              # On ready + deadline auto-close
│   │   └── interactionCreate.js  # Handle all interactions
│   ├── models/
│   │   └── party.js              # Data model + JSON storage
│   └── utils/
│       ├── embeds.js             # EmbedBuilder
│       └── components.js        # Button ActionRows
├── Dockerfile
├── docker-compose.yaml
├── package.json
└── .env.example
```
