import { formatDate } from "./utils";

interface TelegramJobNotification {
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  deadline: Date | string;
  jobUrl: string;
}

export async function sendJobToTelegram(job: TelegramJobNotification): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    console.log("Telegram credentials not configured, skipping notification");
    return false;
  }

  const message = `
💼 *${escapeMarkdown(job.title)}*
🏢 ${escapeMarkdown(job.company)}
📍 ${escapeMarkdown(job.location)}
💰 ${escapeMarkdown(job.salary)}
🕒 ${escapeMarkdown(job.type)}
📅 Deadline: ${formatDate(job.deadline)}

🔗 [Apply Now](${job.jobUrl})

#EthiopiaJobs #RemoteWork #HiringNow
  `.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: channelId,
          text: message,
          parse_mode: "Markdown",
          disable_web_page_preview: false,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Telegram API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");
}
