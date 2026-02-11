# CodeCom Website 🚀

A modern, futuristic website for CodeCom — a software/app development agency founded by Stanley Yamoah. Built with pure HTML, CSS, and JavaScript with a Node.js backend for email functionality.

## Features

- **Futuristic Design**: Dark theme with cyan accents, no gradients
- **6 Pages**: Home, Products, Portfolio, Founder, Feedback, Careers
- **Portfolio Showcase**: Filterable gallery for websites and UI designs
- **Custom Email Templates**: Beautifully formatted emails sent directly to your Gmail
- **Gmail Integration**: Uses Google App Password for secure email delivery
- **Fully Responsive**: Optimized for all devices and screen sizes
- **Smooth Animations**: Scroll reveals and interactive elements

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Google App Password

To receive form submissions via email:

1. **Enable 2-Factor Authentication** on your Google account (codecomteam25@gmail.com)
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate an App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Add to `.env` file**
   - Open `.env` file in the project root
   - Paste your app password after `GMAIL_APP_PASSWORD=`
   - **Remove all spaces** from the password
   
   Example:
   ```
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

### 3. Add Your Images

Place these images in the `assets/` folder:

- **logo.png** — Your CodeCom logo
- **founder.jpg** — Photo of Stanley Yamoah
- **smartschool-logo.png** — SmartSchool product logo (120x120px recommended)
- **slideai-logo.png** — SlideAI product logo (120x120px recommended)

**Portfolio Images**: Add your project screenshots to `assets/portfolio/`:
- Recommended size: 1200 x 800px (3:2 aspect ratio)
- Format: JPG or PNG
- Name them: `project-1.jpg`, `project-2.jpg`, etc.
- See `assets/portfolio/README.md` for details

### 4. Run the Server

**Development mode** (auto-restart on changes):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The website will be available at: http://localhost:3000

## How It Works

### Email System

The website uses a Node.js backend with Nodemailer to send emails directly through Gmail:

- **Career Applications** → Sent to codecomteam25@gmail.com with formatted template
- **Feedback Submissions** → Sent to codecomteam25@gmail.com with star rating display

### Custom Email Templates

Two beautiful HTML email templates are included:

1. **Career Application Template**
   - Professional layout with all applicant details
   - Includes: name, email, phone, position, experience, portfolio, motivation

2. **Feedback Template**
   - Star rating visualization
   - Client details and feedback message
   - Styled with CodeCom branding

### API Endpoints

- `POST /api/submit-application` — Career form submissions
- `POST /api/submit-feedback` — Feedback form submissions

## File Structure

```
codecom/
├── index.html              # Home page
├── founder.html            # Founder bio page
├── projects.html           # Product showcases
├── portfolio.html          # Portfolio gallery (NEW)
├── feedback.html           # Client feedback page
├── careers.html            # Job listings + application form
├── css/
│   └── style.css          # All styles (fully responsive)
├── js/
│   └── main.js            # Frontend JavaScript
├── assets/
│   ├── logo.png           # Your logo (add this)
│   ├── founder.jpg        # Founder photo (add this)
│   ├── smartschool-logo.png  # SmartSchool logo (add this)
│   ├── slideai-logo.png   # SlideAI logo (add this)
│   └── portfolio/         # Portfolio images folder (add images)
├── server.js              # Backend server
├── package.json           # Dependencies
├── .env                   # Environment variables
└── README.md              # This file
```

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Email**: Nodemailer with Gmail
- **Fonts**: Google Fonts (Space Grotesk, Inter, JetBrains Mono)
- **Icons**: Custom inline SVGs

## Career Roles Available

1. **Cybersecurity Analyst** — Remote
2. **Product Sales Representative — SmartSchool** — Onsite
3. **Product Sales Representative — SlideAI** — Onsite
4. **Cold Calling Specialist** — Remote

## Projects Featured

1. **SmartSchool** — Comprehensive school management system (smartschoolgh.com)
2. **SlideAI** — AI-powered presentation generator (slideai.site)

## Support

For questions, email: codecomteam25@gmail.com

---

**© 2026 CodeCom — Building Digital Excellence**
