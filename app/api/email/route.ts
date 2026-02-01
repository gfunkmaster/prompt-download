import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { email, prompt, imageBase64 } = await req.json();

        if (!email || !prompt) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Configure Transporter
        // NOTE: In production, use env vars. For MVP, we need user config.
        // We will use a dummy transport or instruct user to provide creds via ENV.

        // For now, if no env vars, we log it (Dev Mode).
        if (!process.env.SMTP_HOST) {
            console.log("--------------- EMAIL SIMULATION ---------------");
            console.log(`To: ${email}`);
            console.log(`Prompt: ${prompt}`);
            console.log("------------------------------------------------");
            return NextResponse.json({ success: true, mode: 'simulation' });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: '"PromptScanner" <no-reply@promptscanner.app>',
            to: email,
            subject: 'Your Extracted Prompt',
            text: prompt,
            html: `
        <div style="font-family: sans-serif; color: #333;">
            <h2>Here is your extracted prompt:</h2>
            <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <pre style="white-space: pre-wrap;">${prompt}</pre>
            </div>
            <p>Sent from <strong>PromptScanner</strong></p>
        </div>
      `
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Email Error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
