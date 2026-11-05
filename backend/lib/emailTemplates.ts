/**
 * Professional HTML email templates for Nepal Horizon.
 *
 * Email clients are stuck in 2008, so everything is inline-styled and table-free
 * where possible. Keep the palette to ink + paper + the brand teal accent.
 */

const BRAND = "Nepal Horizon";
const SUPPORT = "keshwor12@gmail.com";

function shell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:Georgia,'Times New Roman',serif;color:#3a3a38;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid rgba(28,25,20,0.14);">
          <tr>
            <td style="padding:28px 32px 16px;border-bottom:1px solid rgba(28,25,20,0.14);">
              <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6a6a6a;">${BRAND}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(28,25,20,0.14);">
              <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.08em;color:#6a6a6a;">
                Mountain journeys, Nepal · <a href="mailto:${SUPPORT}" style="color:#1c6360;text-decoration:none;">${SUPPORT}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="background:#1c6360;">
        <a href="${url}" style="display:inline-block;padding:14px 28px;font-family:'Courier New',monospace;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#f7f5f0;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function verificationEmail(name: string, url: string): string {
  const greeting = name ? `Hello ${escapeHtml(name)},` : "Hello,";
  return shell(
    "Verify your email",
    `<h1 style="margin:0 0 12px;font-size:26px;font-weight:500;letter-spacing:-0.02em;line-height:1.15;">Confirm your email address</h1>
     <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${greeting}</p>
     <p style="margin:0 0 8px;font-size:15px;line-height:1.6;">One last step — confirm the address the field office will write to. Click the button below to verify your account.</p>
     ${button("Verify email", url)}
     <p style="margin:0;font-size:13px;line-height:1.6;color:#6a6a6a;">If the button does not work, copy and paste this link into your browser:</p>
     <p style="margin:8px 0 0;font-size:12px;line-height:1.6;word-break:break-all;"><a href="${url}" style="color:#1c6360;">${url}</a></p>
     <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6a6a6a;">If you did not create an account with ${BRAND}, you can safely ignore this email.</p>`,
  );
}

export function resetPasswordEmail(name: string, url: string): string {
  const greeting = name ? `Hello ${escapeHtml(name)},` : "Hello,";
  return shell(
    "Reset your password",
    `<h1 style="margin:0 0 12px;font-size:26px;font-weight:500;letter-spacing:-0.02em;line-height:1.15;">Reset your password</h1>
     <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${greeting}</p>
     <p style="margin:0 0 8px;font-size:15px;line-height:1.6;">We received a request to reset the password on your ${BRAND} account. Click the button below to choose a new one.</p>
     ${button("Reset password", url)}
     <p style="margin:0;font-size:13px;line-height:1.6;color:#6a6a6a;">This link expires shortly. If it has expired, request a new one from the sign-in page.</p>
     <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#6a6a6a;">If you did not request a reset, you can safely ignore this email — your password will not change.</p>
     <p style="margin:16px 0 0;font-size:12px;line-height:1.6;word-break:break-all;color:#6a6a6a;">Link: <a href="${url}" style="color:#1c6360;">${url}</a></p>`,
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
