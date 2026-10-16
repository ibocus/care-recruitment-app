const GRAPH_API_VERSION = 'v21.0';

export async function sendWhatsAppText(message: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.NOTIFY_WHATSAPP_TO;
  if (!token || !phoneNumberId || !to) {
    throw new Error('WhatsApp is not configured: set WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID and NOTIFY_WHATSAPP_TO');
  }

  const res = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    }),
  });

  if (!res.ok) {
    throw new Error(`WhatsApp API error: ${res.status} ${await res.text()}`);
  }
}

export async function sendWhatsAppNotification(referenceId: string, applicantName: string): Promise<void> {
  await sendWhatsAppText(`New care worker application from ${applicantName}. Reference: ${referenceId}.`);
}
