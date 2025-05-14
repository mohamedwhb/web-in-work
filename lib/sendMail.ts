import nodemailer from "nodemailer";

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = Number.parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || "KMW GmbH <office@kmw.at>";

export async function sendMail({
	to,
	subject,
	html,
}: {
	to: string;
	subject: string;
	html: string;
}) {
	try {
		const transporter = nodemailer.createTransport({
			host: EMAIL_HOST,
			port: EMAIL_PORT,
			secure: EMAIL_PORT === 465,
			auth: {
				user: EMAIL_USER,
				pass: EMAIL_PASS,
			},
		});

		await transporter.sendMail({
			from: EMAIL_FROM,
			to: to,
			subject: subject,
			html,
		});

		return {
			status: "success",
			message: "Email sent successfully",
		};
	} catch (error) {
		console.error("Error sending email:", error);
		return {
			status: "error",
			message: "Failed to send email",
			details: (error as Error).message,
		};
	}
}
