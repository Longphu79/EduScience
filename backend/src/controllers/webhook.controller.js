import { processWebhook } from "../services/webhook.service.js";

export const sepayWebhook = async (req, res) => {
  try {
    // Verify API key
    const authHeader = req.headers.authorization;
    const expectedKey = process.env.SEPAY_WEBHOOK_KEY;

    if (expectedKey && authHeader !== `Apikey ${expectedKey}`) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await processWebhook(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};
