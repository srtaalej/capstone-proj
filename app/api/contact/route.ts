import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = process.env.CONTACT_FORM_TO_EMAIL;
const fromEmail = 'onboarding@resend.dev'; // Using the default Resend onboarding address

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY environment variable is not set.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }
  if (!toEmail) {
    console.error('CONTACT_FORM_TO_EMAIL environment variable is not set.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: `Contact Form <${fromEmail}>`, // Sender name and email
      to: [toEmail], // Recipient email from env var
      replyTo: email, // Set the reply-to to the user's email
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
    }

    console.log('Resend API Success:', data);
    return NextResponse.json({ message: 'Email sent successfully!', data }, { status: 200 });

  } catch (err) {
    console.error('Error processing request:', err);
    // Check if the error is due to invalid JSON
    if (err instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
