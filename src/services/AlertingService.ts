import axios from 'axios';

export class AlertingService {
  /**
   * Sends an alert message to a configured webhook (e.g., Slack or Discord).
   * Falls back gracefully if the ALERT_WEBHOOK_URL is missing.
   *
   * @param message The alert message to send.
   * @param level The severity level ('info', 'warning', 'error').
   */
  public static async sendAlert(message: string, level: 'info' | 'warning' | 'error' = 'info'): Promise<boolean> {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;

    if (!webhookUrl) {
      // Simulate successful offline logging if no webhook is configured
      console.log(`[ALERT - ${level.toUpperCase()}] ${message}`);
      return true;
    }

    try {
      // Formatting the payload minimally. Slack/Discord accept standard "text" or "content" keys.
      const payload = {
        text: `[${level.toUpperCase()}] ${message}`,
        content: `[${level.toUpperCase()}] ${message}`
      };

      await axios.post(webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      return true;
    } catch (error) {
      console.error('Failed to send alert via webhook:', error);
      return false;
    }
  }
}
