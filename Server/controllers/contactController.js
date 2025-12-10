import sendEmail from "../utils/sendEmail.js";

export const sendContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const htmlContent = `
      <h2>New Contact Form Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `;

        await sendEmail({
            to: process.env.RECEIVER_EMAIL,
            subject: `Portfolio Contact — ${subject}`,
            html: htmlContent,
        });

        res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.error("Email send error:", error);
        res.status(500).json({ success: false, error: "Failed to send message" });
    }
};
