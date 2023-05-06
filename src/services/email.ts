import * as nodemailer from 'nodemailer'
import dotenv from 'dotenv';

import { Attendee } from '../types';

dotenv.config();

export interface LogMail {
  subject: string;
  body: string | any;
  to: string;
  person: Attendee;
}


export async function sendEmail(data: LogMail): Promise<string> {

  // In case an error object is passed as body
  const body = typeof data.body === 'string' ? data.body : JSON.stringify(data.body, null, '\t')

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  const mailOptions = {
    from: {
      name: 'River Car Show',
      address: 'rivercarshow@gmail.com'
    },
    to: data.to,
    // to: process.env.ADMIN_EMAIL,
    //replyTo: `"Outreach Department outreach@revival.com"`,
    subject: data.subject,
    html: body
  };

  return transporter.sendMail(mailOptions)
    .then(() => {
      console.log(`📧 Email sent to ${data.person.FirstName}`);
      return "OK"
    })
    .catch(error => {
      console.log(`🛑 trying to send email to ${data.person.FirstName}`, error.response, error.code, error.responseCode)
      return "ERROR"
    })
}