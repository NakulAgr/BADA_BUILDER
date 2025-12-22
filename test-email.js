import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;

console.log('--- Gmail Auth Test ---');
console.log('User:', user);
console.log('Password Length:', pass ? pass.length : 0);
console.log('Contains Spaces:', pass ? pass.includes(' ') : false);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
});

console.log('Attempting to send test email...');

try {
    const info = await transporter.sendMail({
        from: user,
        to: user,
        subject: 'Test Email',
        text: 'If you see this, authentication worked!'
    });
    console.log('✅ Success! Email sent:', info.messageId);
} catch (err) {
    console.error('❌ Auth Failed:', err.message);
    if (err.message.includes('535')) {
        console.log('\nPossible reasons:');
        console.log('1. Invalid App Password (copy exactly)');
        console.log('2. 2-Step Verification not enabled');
        console.log('3. Wrong email address');
    }
}
