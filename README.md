# 🎯 tang-ty — Discord Party Bot (discord.js)

บอทสำหรับรวมกลุ่มกิจกรรมบน Discord | Built with discord.js v14

## Slash Commands

| Command | คำอธิบาย |
|---------|----------|
| `/tangty` | สร้างปาร์ตี้ใหม่ (เปิด Modal) |
| `/tangty-soj` | สร้างปาร์ตี้ SOJ พร้อมเลือกอาชีพ |
| `/tangty-list` | ดูรายการปาร์ตี้ที่เปิดอยู่ |
| `/tangty-info <id>` | ดูรายละเอียดด้วย Party ID |
| `/tangty-log` | ตั้งค่า Server Log (ต้องมีสิทธิ์ `Manage Server`) |

## ปุ่มในปาร์ตี้

| ปุ่ม | ใครกดได้ |
|------|---------|
| ✅ เข้าร่วม | ทุกคน |
| 🚪 ออกจากปาร์ตี้ | สมาชิก (ยกเว้นหัวหน้า) |
| 🔒 ปิดรับสมาชิก | หัวหน้าปาร์ตี้ |
| 🔓 เปิดรับสมาชิก | หัวหน้าปาร์ตี้ |
| ❌ ยกเลิกปาร์ตี้ | หัวหน้าปาร์ตี้ |

## SOJ Party

`/tangty-soj` ทำงานเหมือน `/tangty` แต่มีระบบเลือกอาชีพเพิ่มเติม

**อาชีพที่รองรับ:** Ironclad, Sylph, Bloodstorm, Celestune, Nightwaker, Numina, Dragonsvelte

**Flow ผู้สร้าง:**
1. `/tangty-soj` → เลือกอาชีพของตัวเอง (dropdown)
2. กรอก Modal (ชื่อกิจกรรม, จำนวนสมาชิก, deadline)
3. ปาร์ตี้ถูกสร้างพร้อมแสดงอาชีพหัวหน้า

**Flow ผู้เข้าร่วม:**
1. กดปุ่ม ✅ เข้าร่วม → เลือกอาชีพ (ephemeral dropdown)
2. เข้าร่วมพร้อมแสดงอาชีพในรายชื่อสมาชิก

## 📝 Server Log

แจ้งเตือนกิจกรรมของเซิร์ฟเวอร์ลงใน text channel ที่เลือกไว้

| เหตุการณ์ | รายละเอียดที่แสดง |
|-----------|-------------------|
| 🔊 เข้าห้องเสียง | ชื่อผู้ใช้, ชื่อห้องเสียง, วันที่และเวลา |
| 🔈 ออกจากห้องเสียง | ชื่อผู้ใช้, ชื่อห้องเสียง, วันที่และเวลา |
| 🔁 ย้ายห้องเสียง | ชื่อผู้ใช้, ห้องต้นทาง → ห้องปลายทาง, วันที่และเวลา |
| 📥 เข้าเซิร์ฟเวอร์ | ชื่อผู้ใช้, วันที่และเวลา, จำนวนสมาชิก |
| 📤 ออกจากเซิร์ฟเวอร์ | ชื่อผู้ใช้, วันที่และเวลา, จำนวนสมาชิก |

ครอบคลุม **ทุกห้องเสียง** ในเซิร์ฟเวอร์ และวันเวลาแสดงตามโซนเวลาไทย (Asia/Bangkok)

### คำสั่ง

| Command | คำอธิบาย |
|---------|----------|
| `/tangty-log set channel:#ห้อง` | เลือกห้องที่จะส่ง log |
| `/tangty-log status` | ดูการตั้งค่าปัจจุบัน |
| `/tangty-log off` | ปิดการแจ้งเตือน log |

ทุกคำสั่งจำกัดเฉพาะผู้ที่มีสิทธิ์ `Manage Server`

### การแยก log ระหว่างเซิร์ฟเวอร์

การตั้งค่าเก็บแยกตาม Guild ID และตอนส่ง log บอทจะ:

1. อ่าน config ของ guild ที่เกิดเหตุการณ์เท่านั้น
2. ดึงห้องผ่าน `guild.channels` (ไม่ใช่ `client.channels`)
3. ตรวจซ้ำว่า `channel.guildId === guild.id` ก่อนส่ง

ทำให้ log ของเซิร์ฟเวอร์หนึ่ง**ไม่มีทางไปแสดงที่อีกเซิร์ฟเวอร์หนึ่ง** ถ้าเซิร์ฟเวอร์ไหนยังไม่ตั้งค่า ห้องถูกลบ หรือบอทไม่มีสิทธิ์ส่ง — จะเงียบไว้เฉย ๆ ไม่ error

> หมายเหตุ: บอทอื่น (เช่นบอทเพลง) ที่เข้า-ออกห้องเสียงจะถูก log ด้วย

## วิธีติดตั้ง

### 1. สร้าง Discord Bot

1. ไปที่ [Discord Developer Portal](https://discord.com/developers/applications)
2. สร้าง Application → ไปที่ **Bot**
3. เปิด **Server Members Intent** และ **Message Content Intent** (Server Members Intent จำเป็นสำหรับ log คนเข้า-ออกเซิร์ฟเวอร์)
4. คัดลอก **Token** และ **Application ID (Client ID)**
5. **OAuth2 → URL Generator**: เลือก `bot` + `applications.commands`
6. Bot Permissions: `Send Messages`, `Embed Links`, `Read Message History`, `View Channels`
7. เชิญบอทเข้าเซิร์ฟเวอร์

### 2. ตั้งค่า

```bash
cp .env.example .env
nano .env   # ใส่ DISCORD_TOKEN และ CLIENT_ID
```

### 3. Register Slash Commands (ทำครั้งแรกครั้งเดียว หรือเมื่อเพิ่ม command ใหม่)

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
tang-ty/
├── src/
│   ├── index.js                  # Entry point
│   ├── deploy-commands.js        # Register slash commands
│   ├── commands/
│   │   ├── party.js              # /tangty command
│   │   ├── party-soj.js          # /tangty-soj command + SOJ_CLASSES
│   │   ├── party-list-info.js    # /tangty-list, /tangty-info
│   │   └── log-config.js         # /tangty-log (set / status / off)
│   ├── events/
│   │   ├── ready.js              # On ready + deadline auto-close
│   │   ├── interactionCreate.js  # Handle all interactions
│   │   ├── voiceStateUpdate.js   # Log เข้า/ออก/ย้ายห้องเสียง
│   │   ├── guildMemberAdd.js     # Log คนเข้าเซิร์ฟเวอร์
│   │   └── guildMemberRemove.js  # Log คนออกจากเซิร์ฟเวอร์
│   ├── models/
│   │   ├── party.js              # Data model + JSON storage
│   │   └── log-config.js         # ห้อง log แยกตามเซิร์ฟเวอร์
│   └── utils/
│       ├── embeds.js             # EmbedBuilder
│       ├── components.js         # Button ActionRows
│       ├── log-embeds.js         # Embed ของ server log
│       └── server-log.js         # ส่ง log แบบแยกตามเซิร์ฟเวอร์
├── Dockerfile
├── docker-compose.yaml
├── package.json
└── .env.example
```
