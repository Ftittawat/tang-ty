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
| `/tangty-trip` | To-do list สถานที่เที่ยวที่อยากไป |

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

## 🧳 Trip To-do List

รายการสถานที่เที่ยวที่อยากไป กดโหวต "อยากไป" และเช็คว่าไปมาแล้ว

| Command | คำอธิบาย |
|---------|----------|
| `/tangty-trip add` | เพิ่มสถานที่ (เปิด Modal: สถานที่ + รายละเอียด) |
| `/tangty-trip list` | ดูรายการทั้งหมดในเซิร์ฟเวอร์ (แยก อยากไป / ไปแล้ว) |

### ปุ่มในแต่ละรายการ

| ปุ่ม | ใครกดได้ | ผล |
|------|---------|-----|
| 🙋 อยากไป | ทุกคน | เพิ่มชื่อเข้ารายชื่อคนอยากไป (กดซ้ำ = ยกเลิก) |
| ✅ ไปแล้ว | ผู้เพิ่ม / `Manage Server` | เปลี่ยนสถานะเป็นไปแล้ว (กดซ้ำ = ย้อนกลับ) |
| 🗑️ ลบรายการ | ผู้เพิ่ม / `Manage Server` | ลบรายการออกจาก to-do list |

ข้อมูลที่แสดงในแต่ละรายการ:

- 📍 ชื่อสถานที่ + รายละเอียด (ถ้ามี)
- สถานะ 🕒 อยากไป / ✅ ไปแล้ว
- **ผู้เพิ่ม** รายการ
- รายชื่อ **คนที่อยากไป** พร้อมจำนวน

รายการแยกตามเซิร์ฟเวอร์ — `/tangty-trip list` เห็นเฉพาะของเซิร์ฟเวอร์ตัวเอง และปุ่มของรายการเซิร์ฟเวอร์อื่นกดข้ามไม่ได้

> การลบจะเปลี่ยนข้อความเดิมเป็น "🗑️ ลบรายการแล้ว" (ไม่ได้ลบข้อความทิ้ง) เพื่อให้ยังเห็นร่องรอยว่าใครลบ

## 📝 Server Log

แจ้งเตือนกิจกรรมของเซิร์ฟเวอร์ลงใน text channel ที่เลือกไว้

แสดงแบบสั้น บรรทัดเดียว: **ชื่อ + action + ช่อง**

| เหตุการณ์ | ข้อความ |
|-----------|---------|
| เข้าช่องเสียง | @ชื่อ เข้าช่องเสียง `ห้องนั่งเล่น` |
| ออกจากช่องเสียง | @ชื่อ ออกจากช่องเสียง `ห้องนั่งเล่น` |
| ย้ายช่องเสียง | @ชื่อ ย้ายช่องเสียง `ห้องนั่งเล่น` → `ห้องเกม` |
| เข้าเซิร์ฟเวอร์ | @ชื่อ เข้าร่วมเซิร์ฟเวอร์ |
| ออกจากเซิร์ฟเวอร์ | @ชื่อ ออกจากเซิร์ฟเวอร์ |

- ชื่อผู้ใช้อยู่ด้านบน embed (พร้อมรูปโปรไฟล์) และ mention ในข้อความ
- footer แสดงหมวดหมู่ของช่องเสียง + วันที่และเวลา (Discord แสดงตามโซนเวลาของผู้อ่าน)
- สีแถบซ้าย: เขียว = เข้า, แดง = ออก, ม่วง = ย้าย
- ครอบคลุม **ทุกช่องเสียง** ในเซิร์ฟเวอร์

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
│   │   ├── log-config.js         # /tangty-log (set / status / off)
│   │   └── trip.js               # /tangty-trip + ปุ่มของ to-do list
│   ├── events/
│   │   ├── ready.js              # On ready + deadline auto-close
│   │   ├── interactionCreate.js  # Handle all interactions
│   │   ├── voiceStateUpdate.js   # Log เข้า/ออก/ย้ายห้องเสียง
│   │   ├── guildMemberAdd.js     # Log คนเข้าเซิร์ฟเวอร์
│   │   └── guildMemberRemove.js  # Log คนออกจากเซิร์ฟเวอร์
│   ├── models/
│   │   ├── party.js              # Data model + JSON storage
│   │   ├── log-config.js         # ห้อง log แยกตามเซิร์ฟเวอร์
│   │   └── trip.js               # To-do list สถานที่เที่ยว
│   └── utils/
│       ├── embeds.js             # EmbedBuilder
│       ├── components.js         # Button ActionRows
│       ├── log-embeds.js         # Embed ของ server log
│       ├── server-log.js         # ส่ง log แบบแยกตามเซิร์ฟเวอร์
│       └── trip-embeds.js        # Embed + ปุ่มของ trip
├── Dockerfile
├── docker-compose.yaml
├── package.json
└── .env.example
```
