import https from "https";

const SMS_ACCESS_TOKEN = Buffer.from(process.env.SMS_ACCESS_TOKEN!, "utf-8");

type SmsType = 2 | 3 | 4;

interface SendSmsPayload {
  to: string[];
  content: string;
  sms_type: SmsType;
  sender?: string;
}

export function sendSMS(
  phones: string[],
  content: string,
  type: SmsType,
  sender: string = ""
): Promise<void> {
  return new Promise((resolve, reject) => {
    const payload: SendSmsPayload = {
      to: phones,
      content,
      sms_type: type,
      sender,
    };

    const params = JSON.stringify(payload);

    const auth = `Basic ${Buffer.from(`${SMS_ACCESS_TOKEN}:x`).toString(
      "base64"
    )}`;

    const options: https.RequestOptions = {
      hostname: "api.speedsms.vn",
      port: 443,
      path: "/index.php/sms/send",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
        "Content-Length": Buffer.byteLength(params),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";

      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(body);

          if (json.status === "success") {
            console.log("Send SMS success");
            resolve();
          } else {
            console.error("Send SMS failed:", body);
            reject(new Error(body));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (err) => {
      console.error("Send SMS error:", err);
      reject(err);
    });

    req.write(params);
    req.end();
  });
}
