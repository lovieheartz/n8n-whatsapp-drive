const twilio = require('twilio');

class TwilioHelper {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  }

  async sendMessage(to, message) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });
      console.log(`📤 Message sent: ${result.sid}`);
      return result;
    } catch (error) {
      console.error('❌ Twilio error:', error.message);
      throw error;
    }
  }

  async sendWhatsAppMessage(to, message) {
    // Ensure WhatsApp format
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    return this.sendMessage(whatsappTo, message);
  }

  validateWebhook(signature, url, params) {
    return twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      signature,
      url,
      params
    );
  }

  formatPhoneNumber(number) {
    // Remove whatsapp: prefix if present
    return number.replace('whatsapp:', '');
  }
}

module.exports = TwilioHelper;