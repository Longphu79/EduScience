import { processWebhook } from "../services/webhook.service.js";

export const sepayWebhook = async (req, res) => {
  try {
    // Verify API key
    const authHeader = req.headers.authorization;
    const expectedKey = process.env.SEPAY_WEBHOOK_KEY;

    if (expectedKey && authHeader !== `Apikey ${expectedKey}`) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await processWebhook(req.body);
    res.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    // Always return success to prevent SePay retries on our errors
    res.json({ success: true });
  }
};
