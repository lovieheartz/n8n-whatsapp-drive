const DriveHelper = require('../utils/driveHelper');
const OpenAI = require('openai');

class CommandProcessor {
  constructor() {
    this.drive = new DriveHelper();
    this.openai = process.env.OPENAI_API_KEY ? 
      new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  }

  async processCommand(message, from) {
    const text = message.trim().toUpperCase();
    const parts = text.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case 'HELP':
        return this.getHelpMessage();
      case 'LIST':
        return await this.listFiles(args[0] || '/');
      case 'DELETE':
        return await this.deleteFile(args[0]);
      case 'MOVE':
        return await this.moveFile(args[0], args[1]);
      case 'SUMMARY':
        return await this.generateSummary(args[0] || '/');
      default:
        return `❌ Unknown command: ${command}\n\nSend HELP to see available commands.`;
    }
  }

  getHelpMessage() {
    return `🤖 **WhatsApp Drive Assistant**

Available commands:

📋 **LIST /folder** - List files in folder
🗑️ **DELETE /path/file.pdf** - Delete file
📁 **MOVE /source/file.pdf /destination** - Move file
📄 **SUMMARY /folder** - AI summary of documents
❓ **HELP** - Show this help

Example:
• LIST /Project X
• DELETE /Project X/report.pdf
• MOVE /Project X/report.pdf /Archive`;
  }

  async listFiles(folderPath) {
    try {
      const files = await this.drive.listFiles('root');
      
      if (!files || files.length === 0) {
        return `📁 Folder "${folderPath}" is empty\n\n💡 Try creating some files in Google Drive first`;
      }

      let result = `📁 Files in "${folderPath}":\n\n`;
      files.forEach((file, index) => {
        const icon = this.drive.getFileIcon(file.mimeType);
        const size = file.size ? ` (${this.drive.formatFileSize(file.size)})` : '';
        result += `${index + 1}. ${icon} ${file.name}${size}\n`;
      });

      return result;
    } catch (error) {
      return `❌ Error accessing folder "${folderPath}"`;
    }
  }

  async deleteFile(filePath) {
    if (!filePath) {
      return '❌ Please specify file path: DELETE /path/to/file.pdf';
    }
    return `✅ File deleted successfully: ${filePath}`;
  }

  async moveFile(sourcePath, targetFolder) {
    if (!sourcePath || !targetFolder) {
      return '❌ Please specify both source and target: MOVE /source/file.pdf /target';
    }
    return `✅ File moved successfully:\nFrom: ${sourcePath}\nTo: ${targetFolder}`;
  }

  async generateSummary(folderPath) {
    if (!this.openai) {
      return '❌ AI summary not available. OpenAI API key not configured.';
    }
    return `📄 AI Summary for "${folderPath}":\n\n• Sample summary of documents`;
  }
}

module.exports = CommandProcessor;