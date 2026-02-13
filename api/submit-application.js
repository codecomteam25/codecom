const nodemailer = require('nodemailer');
const multiparty = require('multiparty');

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
    .cv-note { background: #e8f4f8; padding: 12px; border-radius: 6px; color: #0a0a0f; margin-top: 10px; }
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
      ${data.cvFileName ? `
      <div class="field">
        <div class="label">CV/Resume</div>
        <div class="cv-note">📎 CV Attached: ${data.cvFileName}</div>
      </div>
      ` : ''}
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

const parseMultipartForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    const fields = {};
    const files = [];

    form.on('field', (name, value) => {
      fields[name] = value;
    });

    form.on('part', (part) => {
      if (part.filename) {
        const chunks = [];
        part.on('data', (chunk) => {
          chunks.push(chunk);
        });
        part.on('end', () => {
          files.push({
            fieldname: part.name,
            filename: part.filename,
            content: Buffer.concat(chunks),
            contentType: part.headers['content-type']
          });
        });
      } else {
        part.resume();
      }
    });

    form.on('close', () => {
      resolve({ fields, files });
    });

    form.on('error', (err) => {
      reject(err);
    });

    form.parse(req);
  });
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

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({
      success: false,
      message: 'Server email is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in Vercel environment variables.'
    });
  }

  try {
    // Parse multipart form data
    const { fields, files } = await parseMultipartForm(req);
    
    const { name, email, phone, location, position, experience, portfolio, motivation, additional } = fields;

    if (!name || !email || !position || !motivation) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    // Find CV file
    const cvFile = files.find(f => f.fieldname === 'cv');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: `"CodeCom Careers" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `New Application: ${position} - ${name}`,
      html: getCareerApplicationTemplate({ 
        name, email, phone, location, position, experience, portfolio, motivation, additional,
        cvFileName: cvFile ? cvFile.filename : null
      }),
      replyTo: email
    };

    // Attach CV if present
    if (cvFile) {
      mailOptions.attachments = [{
        filename: cvFile.filename,
        content: cvFile.content,
        contentType: cvFile.contentType
      }];
    }

    await transporter.sendMail(mailOptions);

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
