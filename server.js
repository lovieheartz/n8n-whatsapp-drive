const express = require('express');
const twilio = require('twilio');
const { google } = require('googleapis');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Initialize services
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Google Drive setup
const auth = new google.auth.GoogleAuth({
  keyFile: 'config/google-credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive']
});
const drive = google.drive({ version: 'v3', auth });

// WhatsApp webhook endpoint
app.post('/webhook/whatsapp', async (req, res) => {
  const { Body: message, From: from } = req.body;
  
  console.log(`📨 Received message from ${from}: ${message}`);
  
  try {
    const response = await processCommand(message, from);
    await sendWhatsAppMessage(from, response);
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Error processing message:', error);
    await sendWhatsAppMessage(from, '❌ Sorry, something went wrong. Please try again.');
    res.status(500).send('Error');
  }
});

// Process WhatsApp commands
async function processCommand(message, from) {
  const text = message.trim().toUpperCase();
  const parts = text.split(' ');
  const command = parts[0];
  const args = parts.slice(1);

  switch (command) {
    case 'HELP':
      return getHelpMessage();
    
    case 'LIST':
      const folderPath = args[0] || '/';
      return await listFiles(folderPath);
    
    case 'DELETE':
      const fileToDelete = args[0];
      return await deleteFile(fileToDelete);
    
    case 'MOVE':
      const sourceFile = args[0];
      const targetFolder = args[1];
      return await moveFile(sourceFile, targetFolder);
    
    case 'SUMMARY':
      const summaryFolder = args[0] || '/';
      return await generateSummary(summaryFolder);
    
    default:
      return `❌ Unknown command: ${command}\n\nSend HELP to see available commands.`;
  }
}

// Help message
function getHelpMessage() {
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

// List files in Google Drive
async function listFiles(folderPath) {
  try {
    const folderId = await getFolderId(folderPath);
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, size)',
      orderBy: 'name'
    });

    const files = response.data.files;
    
    if (!files || files.length === 0) {
      return `📁 Folder "${folderPath}" is empty

💡 Try:
• LIST / (root folder)
• Create some files in Google Drive first`;
    }

    let result = `📁 Files in "${folderPath}":\n\n`;
    files.forEach((file, index) => {
      const icon = file.mimeType.includes('folder') ? '📁' : '📄';
      const size = file.size ? ` (${formatFileSize(file.size)})` : '';
      result += `${index + 1}. ${icon} ${file.name}${size}\n`;
    });

    return result;
  } catch (error) {
    console.error('Error listing files:', error);
    return `❌ Error accessing folder "${folderPath}"\n\nFolder may not exist or you don't have access.`;
  }
}

// Delete file from Google Drive
async function deleteFile(filePath) {
  try {
    const fileId = await getFileId(filePath);
    await drive.files.delete({ fileId });
    return `✅ File deleted successfully: ${filePath}`;
  } catch (error) {
    console.error('Error deleting file:', error);
    return `❌ Error deleting file: ${filePath}\n\nFile may not exist or you don't have permission.`;
  }
}

// Move file in Google Drive
async function moveFile(sourcePath, targetFolder) {
  try {
    const fileId = await getFileId(sourcePath);
    const targetFolderId = await getFolderId(targetFolder);
    
    // Get current parents
    const file = await drive.files.get({ fileId, fields: 'parents' });
    const previousParents = file.data.parents.join(',');
    
    // Move file
    await drive.files.update({
      fileId,
      addParents: targetFolderId,
      removeParents: previousParents
    });
    
    return `✅ File moved successfully:\nFrom: ${sourcePath}\nTo: ${targetFolder}`;
  } catch (error) {
    console.error('Error moving file:', error);
    return `❌ Error moving file: ${sourcePath}\n\nFile or folder may not exist.`;
  }
}

// Generate AI summary of documents
async function generateSummary(folderPath) {
  try {
    const files = await getDocumentContents(folderPath);
    
    if (files.length === 0) {
      return `📁 No documents found in "${folderPath}" for summary.`;
    }

    const prompt = `Summarize these documents:\n\n${files.map(f => `${f.name}:\n${f.content}`).join('\n\n')}`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a document summarizer. Provide concise bullet-point summaries." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000
    });

    return `📄 AI Summary for "${folderPath}":\n\n${completion.choices[0].message.content}`;
  } catch (error) {
    console.error('Error generating summary:', error);
    return `❌ Error generating summary for "${folderPath}"\n\nMake sure OpenAI API key is configured.`;
  }
}

// Helper functions
async function getFolderId(folderPath) {
  if (folderPath === '/' || folderPath === 'root') {
    return 'root';
  }
  
  const response = await drive.files.list({
    q: `name='${folderPath.replace(/^\//, '')}' and mimeType='application/vnd.google-apps.folder'`,
    fields: 'files(id)'
  });
  
  if (response.data.files.length === 0) {
    throw new Error('Folder not found');
  }
  
  return response.data.files[0].id;
}

async function getFileId(filePath) {
  const fileName = filePath.split('/').pop();
  const response = await drive.files.list({
    q: `name='${fileName}'`,
    fields: 'files(id)'
  });
  
  if (response.data.files.length === 0) {
    throw new Error('File not found');
  }
  
  return response.data.files[0].id;
}

async function getDocumentContents(folderPath) {
  // Simplified - in real implementation, would extract text from various file types
  return [];
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Send WhatsApp message via Twilio
async function sendWhatsAppMessage(to, message) {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: to
    });
    console.log(`📤 Sent message to ${to}`);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 WhatsApp Drive Assistant server running on port ${port}`);
  console.log(`📡 Webhook URL: http://localhost:${port}/webhook/whatsapp`);
  console.log('💡 Use ngrok to expose this URL to Twilio');
});