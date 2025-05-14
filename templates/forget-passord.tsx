import {
	Body,
	Head,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";

type Props = {
	name: string;
	resetUrl: string;
};

export default function ForgetPasswordEmail({ name, resetUrl }: Props) {
	return (
		<Html>
			<Head />
			<Body style={{ margin: 0, padding: 0 }}>
				<Preview>Passwort zurücksetzen anfordern</Preview>
				<Section style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
					<Text style={{ fontSize: "18px", marginBottom: "10px" }}>
						Hallo {name},
					</Text>

					<Text style={{ fontSize: "16px", marginBottom: "10px" }}>
						Wir haben eine Anfrage erhalten, das Passwort für Ihr Konto
						zurückzusetzen.
					</Text>

					<Text style={{ fontSize: "16px", marginBottom: "10px" }}>
						Um fortzufahren, klicken Sie bitte auf den folgenden Link:
					</Text>

					<Text style={{ fontSize: "16px", marginBottom: "20px" }}>
						<a href={resetUrl} style={{ color: "#1D72B8" }}>
							Passwort zurücksetzen
						</a>
					</Text>

					<Text style={{ fontSize: "14px", marginTop: "20px", color: "#555" }}>
						Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail
						ignorieren.
					</Text>

					<Text style={{ fontSize: "14px", marginTop: "30px", color: "#999" }}>
						Mit freundlichen Grüßen,
						<br />
						KMV
					</Text>
				</Section>
			</Body>
		</Html>
	);
}
