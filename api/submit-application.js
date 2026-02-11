const nodemailer = require('nodemailer');

const getCareerApplicationTemplate = (data) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; }
    .header { background: #0a0a0f; color: #00d4ff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0; }
    .field:last-child { border-bottom: none; }
    .label { font-weight: 600; color: #0a0a0f; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .value { color: #333; font-size: 16px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 New Career Application</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Applicant Name</div>
        <div class="value">${data.name || ''}</div>
      </div>
      <div class="field">
        <div class="label">Email Address</div>
        <div class="value">${data.email || ''}</div>
      </div>
      <div class="field">
        <div class="label">Phone Number</div>
        <div class="value">${data.phone || ''}</div>
      </div>
      <div class="field">
        <div class="label">Location</div>
        <div class="value">${data.location || ''}</div>
      </div>
      <div class="field">
        <div class="label">Position Applied For</div>
        <div class="value">${data.position || ''}</div>
      </div>
      <div class="field">
        <div class="label">Experience Level</div>
        <div class="value">${data.experience || ''}</div>
      </div>
      ${data.portfolio ? `
      <div class="field">
        <div class="label">Portfolio / LinkedIn</div>
        <div class="value"><a href="${data.portfolio}" style="color: #00d4ff;">${data.portfolio}</a></div>
      </div>
      ` : ''}
      <div class="field">
        <div class="label">Why CodeCom?</div>
        <div class="value">${String(data.motivation || '').replace(/\n/g, '<br>')}</div>
      </div>
      ${data.additional ? `
      <div class="field">
        <div class="label">Additional Information</div>
        <div class="value">${String(data.additional || '').replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>This application was submitted via the CodeCom careers page.</p>
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
  const { name, email, phone, location, position, experience, portfolio, motivation, additional } = body;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({
      success: false,
      message: 'Server email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in Vercel environment variables.'
    });
  }

  if (!name || !email || !position || !motivation) {
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
      from: `"CodeCom Careers" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `New Application: ${position} - ${name}`,
      html: getCareerApplicationTemplate({ name, email, phone, location, position, experience, portfolio, motivation, additional }),
      replyTo: email
    });

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully! We'll review it and get back to you soon."
    });
  } catch (error) {
    console.error('Error sending application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit application. Please try again or email us directly.'
    });
  }
};
