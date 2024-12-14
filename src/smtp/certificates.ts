import fs from "fs";
import htmlToImage from "node-html-to-image";
import path from "path";

import { getSrcDir } from "~/global";
import { prisma } from "~/utils/db";
import { sendEmail } from "~/smtp";

let certificateSentSuccess = 0;
let certificateSentError = 0;

async function generateCertificate(
  participantName: string,
  college: string,
  eventName: string,
): Promise<string> {
  try {
    const templatePath = path.join(getSrcDir(), "templates/certificate.html");
    let html = fs.readFileSync(templatePath, "utf-8");

    // Replace {{name}} with participant name
    if (college == "OTHER")
      html = html.replace("{{college}}", " ").replace("<span> OF</span>", "");

    html = html
      .replace("{{name}}", participantName)
      .replace("{{college}}", college)
      .replace("{{event}}", eventName);

    // Generate image from HTML
    const imageBuffer = await htmlToImage({
      html,
    });

    // Save the image file(s)
    let imagePaths: string[] = [];
    if (Array.isArray(imageBuffer)) {
      imagePaths = imageBuffer.map((buffer, index) => {
        const imagePath = path.join(
          getSrcDir(),
          `src/certificate_${index}.png`,
        );
        fs.writeFileSync(imagePath, buffer);
        return imagePath;
      });
    } else {
      const imagePath = path.join(getSrcDir(), "certificate.png");
      fs.writeFileSync(imagePath, imageBuffer);
      imagePaths.push(imagePath);
    }

    return imagePaths[0] ?? ""; // Returning the first image path for simplicity
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw new Error("Error generating certificate");
  }
}

const sendCertificate = async (
  participantName: string,
  college: string,
  eventName: string,
  participantEmail: string,
) => {
  const emailText = `Hi ${participantName},

Thank you for your active participation in Incridea, held from February 22nd-24th at NMAMIT, Nitte.

Your captivating performance perfectly aligned with our theme, 'Dice of Destiny', casting a spell of chance and fortune. Let's continue to embrace the unpredictable twists of creativity and imagination through Incridea in the years to come.❤️

Please find your participation certificate attached.

Warm Regards,
Team Incridea

Check out the Official Aftermovie '24 down below 👇
https://youtu.be/YoWeuaSMytk

Find more updates and highlights of the fest on our Instagram page @incridea 👇
https://instagram.com/incridea
 `;
  const emailSubject = `Incridea Participation Certificate (${eventName})`;
  const certificatePath = await generateCertificate(
    participantName,
    college,
    eventName,
  );
  try {
    await sendEmail({
      to: participantEmail,
      subject: emailSubject,
      text: emailText,
      attachments: [
        {
          path: certificatePath,
          filename: `certificate.png`,
        },
      ],
    });
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send Email: Internal server error");
  }
};

async function sendParticipationCertificate() {
  const participation = await prisma.team.findMany({
    where: {
      attended: true,
    },
    include: {
      TeamMembers: {
        include: {
          User: {
            include: {
              College: true,
            },
          },
        },
      },
      Event: {
        select: {
          name: true,
        },
      },
    },
  });

  const participationData = participation
    .map((team) => {
      return team.TeamMembers.map((member) => {
        return {
          userId: member.userId,
          eventId: team.eventId,
          name: member.User.name,
          eventName: team.Event.name,
          email: member.User.email,
          college: member.User.College?.name,
        };
      });
    })
    .reduce((acc, val) => acc.concat(val), []);

  for (const participant of participationData) {
    try {
      await sendCertificate(
        participant.name,
        participant.college ?? "OTHER",
        participant.eventName,
        participant.email,
      );
      certificateSentSuccess++;
      await prisma.certificateIssue.create({
        data: {
          EventId: participant.eventId,
          userId: participant.userId,
          issued: true,
        },
      });
    } catch (err) {
      console.log(err);
      certificateSentError++;
      await prisma.certificateIssue.create({
        data: {
          EventId: participant.eventId,
          userId: participant.userId,
          issued: false,
        },
      });
    }
    console.log(
      `Sent ${certificateSentSuccess} certificates and ${certificateSentError} failed`,
    );
  }

  fs.writeFileSync("~/participation.json", JSON.stringify(participationData));
}

sendParticipationCertificate()
  .then(() => console.log("done"))
  .catch(console.log);
