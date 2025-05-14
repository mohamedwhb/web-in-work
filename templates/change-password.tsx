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
};

export default function ChangedPassword({ name }: Props) {
	return (
		<Html>
			<Head />
			<Body style={{ margin: 0, padding: 0 }}>
				<Preview>Ihr Passwort wurde erfolgreich geändert</Preview>
				<Section style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
					<Text style={{ fontSize: "18px", marginBottom: "10px" }}>
						Hallo {name},
					</Text>

					<Text style={{ fontSize: "16px", marginBottom: "10px" }}>
						Dies ist eine Bestätigung, dass Ihr Passwort erfolgreich geändert
						wurde.
					</Text>

					<Text style={{ fontSize: "16px", marginBottom: "10px" }}>
						Wenn Sie diese Änderung nicht selbst vorgenommen haben, setzen Sie
						sich bitte umgehend mit unserem Support-Team in Verbindung.
					</Text>

					<Text style={{ fontSize: "14px", marginTop: "30px", color: "#999" }}>
						Mit freundlichen Grüßen,
						<br />
						KMW Team
					</Text>
				</Section>
			</Body>
		</Html>
	);
}
