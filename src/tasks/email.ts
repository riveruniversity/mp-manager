import { getBlankCardIds, getFormResponses, getRiverMembers, getRiverStaff, getAllRiverMembers, putCardId, getImage, getContact } from '../api/api'
import * as fs from 'fs'
import { sleep } from '../util';
import { sendEmail } from '../services/email'

import { attendees } from '../data/carShowNoMP'

sendEmails();

async function sendEmails() {

  for (const person of attendees) {
    const body = `
    <div style="width: 100%; background: #E5E5E5; padding: 35px 0;">
      <center>
        <div style="padding: 2% 5%;">
          <img style="max-width: 230px; min-width: 230px;" src="https://rivercarshow.com/wp-content/uploads/2021/03/car-2--uai-1032x341.png" alt="" /><br /><br /></div>
      </center>
      <div
        style="width: 90%; max-width: 800px; margin: 0 auto;  background: #ffffff; border-radius: 7px; font-family: 'Trebuchet MS';">
        <div style="padding: 2% 5%; color: #505050;">
          <h3>Hello ${person.FirstName},</h3>

          The River Car Show is held on private property. Every person entering the property is required to
          sign a Waiver and
          Liability Form.

          To bypass slow registration lines, please sign the waiver online.
          </p>

          <p style="text-align:center;"><a
              style="color: #fff; background: #ecc357; display: inline-block; text-align: center; text-decoration: none; font-size: 14pt; padding: 5px 50px; border-radius: 6px;"
              title="Sign Waiver" href="https://tinyurl.com/rivercarshow?id=69198" target="_blank"
              rel="noreferrer noopener">Sign Waiver</a>
          </p>


          <!-- <figure style="border-radius:5px; text-align:center;">
        <figcaption style="width:50%;margin:0 auto;"><span style="font-size: 11px;">We'll have your RIVER CAR CLUB BADGE ready for you at our next show on June 10th, so you can
        easily enter future events.</span>
        </figcaption>
            <a title="Package" href="https://tinyurl.com/rivercarshow?id=69198" target="_blank"
              rel="noreferrer noopener"><img style="width: 50%;border-radius:10px;" src="https://rmi-texting.rmiwebservices.com/qr/show/https%3A%2F%2Ftinyurl.com%2Frivercarshow%3Fid%3D69198.png" alt="Sign Waiver" /></a>
          </figure> -->


          <p>
            <div
              style="border-radius: 4px; border: 1px solid #0a81c5; background-color: #ecf5fb; padding: 5px; text-align:left;">
              <strong>✨ Car Show Updates in Brief</strong>
              <ul style="margin: 0px;">
                <li>QR Code FAST PASS</li>
                <li>New Judge Rotations</li>
                <li>New Best in Show Prize of $750 and Best in Show</li>
                <li>New Attractions: RC Car Race Track, Foosball, and Air Hockey Table</li>
              </ul>
            </div>
          </p>


          <p>Thank you for being a part of the River Car Show.</p>

          <p>If you have any questions or comments, please email us at rivercarshow@gmail.com</p>

          <p>
            Thank You,<br>
            River Car Show Team</p>


        </div>
        <!-- <footer
          style="max-width: 100%; background: #444; color: #fff; border-radius: 0 0 5px 5px; text-align: center; font-size: 13px;">
          <br />
          <p><img src="{!SENDER_WEBSITE!}" alt="Signature" width="120" /></p>
            <p><strong>{!SENDER_FIRSTNAME!} {!SENDER_LASTNAME!}</strong><br />{!SENDER_TITLE!}</p>
              <p>+1 (813) 899-0085<br /><br /><br /></p>
        </footer> -->
      </div>
    </div>`;
    sendEmail({ subject: 'Waiver', body, to: person.Email, person })
    await sleep(1000);
  }

}