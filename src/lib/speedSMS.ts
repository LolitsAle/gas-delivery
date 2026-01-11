import axios from "axios";

const SMS_ACCESS_TOKEN = process.env.SMS_ACCESS_TOKEN!;
const SMS_DEVICE_ID = process.env.SMS_DEVICE_ID!;

type SmsType = 2 | 3 | 4;

export interface SendSmsPayload {
  to: string[];
  content: string;
  sms_type: SmsType;
  sender?: string;
}

export async function sendSMS(
  phones: string[],
  content: string,
  type: SmsType,
  sender: string = SMS_DEVICE_ID
): Promise<void> {
  const payload: SendSmsPayload = {
    to: phones,
    content,
    sms_type: type,
    sender,
  };

  const auth = `Basic ${Buffer.from(`${SMS_ACCESS_TOKEN}:x`).toString(
    "base64"
  )}`;

  try {
    const response = await axios.post(
      "https://api.speedsms.vn/index.php/sms/send",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
        timeout: 10000, // optional
      }
    );

    const data = response.data;

    if (data.status === "success") {
      return;
    }

    console.error("Send SMS failed:", data);
    throw new Error(JSON.stringify(data));
  } catch (error: any) {
    console.error("Send SMS error:", error.response?.data || error.message);
    throw error;
  }
}
