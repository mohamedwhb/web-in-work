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
	email: string;
	username: string;
	password: string;
	role: string;
};

export default function CreateUser({
	name,
	email,
	username,
	password,
	role,
}: Props) {
	return (
		<Html>
			<Head />
			<Body style={{ margin: 0, padding: 0 }}>
				<Preview>Willkommens-E-Mail - Benutzer erstellt</Preview>
				<Section style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
					<Text style={{ fontSize: "18px", marginBottom: "10px" }}>
						Hallo {name},
					</Text>

					<Text style={{ fontSize: "16px", marginBottom: "10px" }}>
						Ihr Konto wurde erfolgreich mit den folgenden Angaben erstellt:
					</Text>

					<Text style={{ fontSize: "16px", marginBottom: "5px" }}>
						<strong>E-Mail:</strong> {email}
					</Text>

					<Text style={{ fontSize: "16px", marginBottom: "5px" }}>
						<strong>Username:</strong> {username}
					</Text>

					<Text style={{ fontSize: "16px", marginBottom: "5px" }}>
						<strong>Passwort:</strong> {password}
					</Text>

					<Text style={{ fontSize: "16px", marginBottom: "5px" }}>
						<strong>Rolle:</strong> {role}
					</Text>

					<Text style={{ fontSize: "16px", marginTop: "20px" }}>
						Sie können sich jetzt einloggen und auf Ihr Konto zugreifen. Bitte{" "}
						<a
							href={process.env.NEXT_PUBLIC_BASE_URL}
							style={{ color: "#1D72B8" }}
						>
							hier klicken
						</a>{" "}
						zum Einloggen.
					</Text>

					<Text style={{ fontSize: "16px", marginTop: "10px" }}>
						Wenn Sie Fragen haben, können Sie uns gerne kontaktieren.
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
