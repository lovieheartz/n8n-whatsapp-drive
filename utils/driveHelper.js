const { google } = require('googleapis');

class DriveHelper {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      keyFile: 'config/google-credentials.json',
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  async listFiles(folderId = 'root') {
    const response = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, size, modifiedTime)',
      orderBy: 'name'
    });
    return response.data.files;
  }

  async deleteFile(fileId) {
    await this.drive.files.delete({ fileId });
    return true;
  }

  async moveFile(fileId, targetFolderId) {
    const file = await this.drive.files.get({ fileId, fields: 'parents' });
    const previousParents = file.data.parents.join(',');
    
    await this.drive.files.update({
      fileId,
      addParents: targetFolderId,
      removeParents: previousParents
    });
    return true;
  }

  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType) {
    if (mimeType.includes('folder')) return '📁';
    if (mimeType.includes('document')) return '📄';
    if (mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('pdf')) return '📕';
    return '📄';
  }
}

module.exports = DriveHelper;