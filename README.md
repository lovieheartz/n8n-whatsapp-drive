<div align="center">

# 🤖 WhatsApp Drive Assistant

*Manage your Google Drive files through WhatsApp messages with AI-powered automation*

[![n8n](https://img.shields.io/badge/Built%20with-n8n-FF6D5A?style=for-the-badge&logo=n8n)](https://n8n.io)
[![Twilio](https://img.shields.io/badge/Powered%20by-Twilio-F22F46?style=for-the-badge&logo=twilio)](https://twilio.com)
[![Google Drive](https://img.shields.io/badge/Integrates-Google%20Drive-4285F4?style=for-the-badge&logo=googledrive)](https://drive.google.com)
[![OpenAI](https://img.shields.io/badge/AI%20by-OpenAI-412991?style=for-the-badge&logo=openai)](https://openai.com)

</div>

---

## ✨ Features

| Command | Description | Example |
|---------|-------------|----------|
| 📋 **LIST** | Browse files and folders | `LIST /Project X` |
| 🗑️ **DELETE** | Remove files with confirmation | `DELETE /docs/old-file.pdf` |
| 📁 **MOVE** | Relocate files between folders | `MOVE /temp/report.pdf /archive` |
| 🤖 **SUMMARY** | AI-powered document summaries | `SUMMARY /reports` |
| ❓ **HELP** | Show available commands | `HELP` |

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Twilio account with WhatsApp sandbox
- Google Cloud project with Drive API enabled
- OpenAI API key (optional, for summaries)

### 1️⃣ Install n8n
```bash
npm install -g n8n
n8n start
```
🌐 **Access:** http://localhost:5678

### 2️⃣ Configure Environment
```bash
cp config/.env.sample .env
# Edit .env with your credentials
```

### 3️⃣ Import Workflow
1. Open n8n web interface
2. Click **"+"** → **Import from file**
3. Select `workflows/whatsapp-drive-assistant.json`
4. Configure your credentials
5. **Activate** the workflow ✅

### 4️⃣ Setup Public Webhook
```bash
# Install ngrok
npx ngrok http 5678

# Copy the HTTPS URL and update Twilio webhook
```

## 📱 Usage

### Join Twilio Sandbox
1. Send `join <sandbox-code>` to your Twilio WhatsApp number
2. Wait for confirmation message

### Start Managing Files
```
💬 Send: HELP
🤖 Reply: Available commands list

💬 Send: LIST /
🤖 Reply: 📁 Files in root folder...

💬 Send: LIST /Project X
🤖 Reply: 📄 project-report.pdf (2.1 MB)
         📁 images
         📄 notes.docx (156 KB)
```

## 🔧 Configuration

### Environment Variables
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Google Drive API
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@project.iam.gserviceaccount.com
GOOGLE_PROJECT_ID=your-project-id

# OpenAI (Optional)
OPENAI_API_KEY=sk-proj-xxxxxxxxxx
```

### Credentials Setup
| Service | Required | Purpose |
|---------|----------|----------|
| 🔵 **Twilio** | ✅ Yes | WhatsApp messaging |
| 🟢 **Google Drive** | ✅ Yes | File operations |
| 🟣 **OpenAI** | ⚪ Optional | AI summaries |

## 🏗️ Project Structure

```
📦 WhatsApp Drive Assistant
├── 🔧 workflows/
│   ├── whatsapp-drive-assistant.json     # Main workflow
│   └── whatsapp-drive-fixed.json         # Enhanced version
├── ⚙️ config/
│   ├── .env.sample                       # Environment template
│   └── google-credentials.json.sample    # Google API template
├── 📄 .env                               # Your credentials
├── 🚫 .gitignore                         # Git ignore rules
├── 📦 package.json                       # Dependencies
└── 📖 README.md                          # This file
```

## 🔒 Security Features

- 🔐 **OAuth2** authentication for Google Drive
- ⚠️ **Confirmation required** for DELETE operations
- 📝 **Audit logging** of all file operations
- 🛡️ **Webhook endpoint** security
- 🔒 **Environment variables** for sensitive data

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No WhatsApp replies | Check n8n is running & webhook URL is correct |
| "Unknown command" | Ensure workflow is activated |
| Google Drive errors | Verify service account permissions |
| Rate limit errors | Wait 1-2 minutes between requests |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ using n8n automation**

*Transform your Google Drive management with the power of WhatsApp*

</div>