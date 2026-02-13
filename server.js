const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multiparty = require('multiparty');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Create nodemailer transporter with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Email templates
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

const getFeedbackTemplate = (data) => {
  const stars = '★'.repeat(parseInt(data.rating)) + '☆'.repeat(5 - parseInt(data.rating));
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
        <div class="value">${data.name}</div>
      </div>
      ${data.company ? `
      <div class="field">
        <div class="label">Company / Organization</div>
        <div class="value">${data.company}</div>
      </div>
      ` : ''}
      <div class="field">
        <div class="label">Email Address</div>
        <div class="value">${data.email}</div>
      </div>
      <div class="field">
        <div class="label">Rating</div>
        <div class="value">${data.rating}/5 Stars</div>
      </div>
      <div class="field">
        <div class="label">Feedback</div>
        <div class="feedback-text">${data.feedback.replace(/\n/g, '<br>')}</div>
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

// API endpoint for career applications
app.post('/api/submit-application', async (req, res) => {
  try {
    const contentType = String(req.headers['content-type'] || '');
    const isMultipart = contentType.includes('multipart/form-data');

    const { fields, files } = isMultipart
      ? await parseMultipartForm(req)
      : { fields: req.body || {}, files: [] };

    const { name, email, phone, location, position, experience, portfolio, motivation, additional } = fields;

    // Validation
    if (!name || !email || !position || !motivation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill in all required fields.' 
      });
    }

    const cvFile = Array.isArray(files) ? files.find((f) => f.fieldname === 'cv') : null;

    const mailOptions = {
      from: `"CodeCom Careers" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `New Application: ${position} - ${name}`,
      html: getCareerApplicationTemplate({
        name,
        email,
        phone,
        location,
        position,
        experience,
        portfolio,
        motivation,
        additional,
        cvFileName: cvFile ? cvFile.filename : null
      }),
      replyTo: email
    };

    if (cvFile) {
      mailOptions.attachments = [{
        filename: cvFile.filename,
        content: cvFile.content,
        contentType: cvFile.contentType
      }];
    }

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Application submitted successfully! We\'ll review it and get back to you soon.' 
    });

  } catch (error) {
    console.error('Error sending application:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit application. Please try again or email us directly.' 
    });
  }
});

// API endpoint for feedback
app.post('/api/submit-feedback', async (req, res) => {
  try {
    const { name, company, email, rating, feedback } = req.body;

    // Validation
    if (!name || !email || !rating || !feedback) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill in all required fields.' 
      });
    }

    const mailOptions = {
      from: `"CodeCom Feedback" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `New Feedback: ${rating}★ from ${name}`,
      html: getFeedbackTemplate(req.body),
      replyTo: email
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Thank you for your feedback! We appreciate you taking the time to share your experience.' 
    });

  } catch (error) {
    console.error('Error sending feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit feedback. Please try again or email us directly.' 
    });
  }
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 CodeCom server running on http://localhost:${PORT}`);
  console.log(`📧 Email configured for: ${process.env.GMAIL_USER}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Close the other server or set PORT to a different value.`);
    process.exit(1);
  }
  console.error('❌ Server error:', err);
  process.exit(1);
});
