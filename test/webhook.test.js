const request = require('supertest');
const app = require('../server');

describe('WhatsApp Webhook', () => {
  test('should respond to HELP command', async () => {
    const response = await request(app)
      .post('/webhook/whatsapp')
      .send({
        Body: 'HELP',
        From: 'whatsapp:+1234567890'
      });
    
    expect(response.status).toBe(200);
  });

  test('should respond to LIST command', async () => {
    const response = await request(app)
      .post('/webhook/whatsapp')
      .send({
        Body: 'LIST /',
        From: 'whatsapp:+1234567890'
      });
    
    expect(response.status).toBe(200);
  });
});

describe('Health Check', () => {
  test('should return OK status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });
});