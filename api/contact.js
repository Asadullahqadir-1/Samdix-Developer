const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const gmailUser = String(process.env.GMAIL_USER || '').trim();
  const gmailAppPassword = String(process.env.GMAIL_APP_PASSWORD || '')
    .replace(/\s+/g, '')
    .trim();

  if (!gmailUser || !gmailAppPassword) {
    return res.status(500).json({
      ok: false,
      error: 'Server email is not configured yet.'
    });
  }

  const body = req.body || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const projectType = String(body.projectType || '').trim();
  const message = String(body.message || '').trim();
  const website = String(body.website || '').trim();

  if (website) {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email || !projectType || !message) {
    return res.status(400).json({
      ok: false,
      error: 'Missing required fields.'
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({
      ok: false,
      error: 'Please provide a valid email address.'
    });
  }

  const text = [
    'New website inquiry',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone / Business Type: ${projectType}`,
    '',
    'Message:',
    message
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 16px;">New website inquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone / Business Type:</strong> ${escapeHtml(projectType)}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });

    await transporter.sendMail({
      from: `Samdix Website <${gmailUser}>`,
      to: gmailUser,
      replyTo: email,
      subject: `New Project Inquiry: ${projectType}`,
      text,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact API mail error:', error);

    const errorCode = error && typeof error === 'object' ? String(error.code || '') : '';
    const authFailed = errorCode === 'EAUTH';

    return res.status(500).json({
      ok: false,
      error: authFailed
        ? 'Email authentication failed. Recheck GMAIL_USER, GMAIL_APP_PASSWORD, and Gmail 2-Step Verification.'
        : 'Unable to send message right now.'
    });
  }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
