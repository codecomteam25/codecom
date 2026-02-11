const nodemailer = require('nodemailer');

const getFeedbackTemplate = (data) => {
  const ratingNum = Math.max(1, Math.min(5, parseInt(data.rating, 10) || 0));
  const stars = '★'.repeat(ratingNum) + '☆'.repeat(5 - ratingNum);

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
    .header { background: #0a0a0f; color: #00d4ff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .rating { font-size: 32px; color: #ffd700; margin: 10px 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0; }
    .field:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #0a0a0f; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .value { color: #333; font-size: 16px; }
    .feedback-text { background: #f8f9fa; padding: 15px; border-radius: 6px; font-style: italic; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⭐ New Client Feedback</h1>
      <div class="rating">${stars}</div>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Client Name</div>
        <div class="value">${data.name || ''}</div>
      </div>
      ${data.company ? `
      <div class="field">
        <div class="label">Company / Organization</div>
        <div class="value">${data.company}</div>
      </div>
      ` : ''}
      <div class="field">
        <div class="label">Email Address</div>
        <div class="value">${data.email || ''}</div>
      </div>
      <div class="field">
        <div class="label">Rating</div>
        <div class="value">${ratingNum}/5 Stars</div>
      </div>
      <div class="field">
        <div class="label">Feedback</div>
        <div class="feedback-text">${String(data.feedback || '').replace(/\n/g, '<br>')}</div>
      </div>
    </div>
    <div class="footer">
      <p>This feedback was submitted via the CodeCom feedback page.</p>
      <p>© ${new Date().getFullYear()} CodeCom — Building Digital Excellence</p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

const getBody = (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
};

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const body = getBody(req);
  const { name, company, email, rating, feedback } = body;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({
      success: false,
      message: 'Server email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in Vercel environment variables.'
    });
  }

  if (!name || !email || !rating || !feedback) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `"CodeCom Feedback" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `New Feedback: ${rating}★ from ${name}`,
      html: getFeedbackTemplate({ name, company, email, rating, feedback }),
      replyTo: email
    });

    return res.status(200).json({
      success: true,
      message: 'Thank you for your feedback! We appreciate you taking the time to share your experience.'
    });
  } catch (error) {
    console.error('Error sending feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again or email us directly.'
    });
  }
};
