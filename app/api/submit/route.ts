import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, type, message } = await req.json();

  if (!name || !email || !type || !message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const typeLabel =
    type === "update" ? "Family record update" : "Admin / edit access request";

  try {
    await resend.emails.send({
      from: "Emmetry <admin@updates.emmetry.org>",
      to: "admin@emmetry.org",
      replyTo: email,
      subject: `[Emmetry] ${typeLabel} from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nType: ${typeLabel}\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email send failed:", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
