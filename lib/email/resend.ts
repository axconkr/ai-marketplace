import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@aimarketplace.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.log('[Email] RESEND_API_KEY not configured, skipping email:', options.subject);
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('[Email] Send failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Email] Send error:', error);
    
    try {
      const { error: retryError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (retryError) {
        console.error('[Email] Retry failed:', retryError);
        return false;
      }

      return true;
    } catch (retryErr) {
      console.error('[Email] Retry error:', retryErr);
      return false;
    }
  }
}

export async function sendEmailVerification(
  to: string,
  name: string | null,
  verificationToken: string
): Promise<boolean> {
  const verifyUrl = `${APP_URL}/auth/verify-email?token=${verificationToken}`;
  const userName = name || 'there';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    <div style="background: #10b981; color: white; padding: 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">✉️</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">이메일 인증</h1>
    </div>
    
    <div style="padding: 30px;">
      <p>안녕하세요 ${userName}님,</p>
      <p>AI Marketplace에 가입해 주셔서 감사합니다!</p>
      
      <div style="background: #f9fafb; border-left: 4px solid #10b981; padding: 15px 20px; margin: 20px 0;">
        <p style="margin: 0;">아래 버튼을 클릭하여 이메일 주소를 인증해 주세요.</p>
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${verifyUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          이메일 인증하기
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">
        이 링크는 24시간 후에 만료됩니다.
      </p>
      
      <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
        링크가 작동하지 않는 경우 아래 URL을 브라우저에 직접 붙여넣으세요:<br>
        <span style="word-break: break-all;">${verifyUrl}</span>
      </p>
    </div>
    
    <div style="background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0;">© ${new Date().getFullYear()} AI Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
안녕하세요 ${userName}님,

AI Marketplace에 가입해 주셔서 감사합니다!

아래 링크를 클릭하여 이메일 주소를 인증해 주세요.

이메일 인증: ${verifyUrl}

이 링크는 24시간 후에 만료됩니다.

---
© ${new Date().getFullYear()} AI Marketplace. All rights reserved.
  `;

  return sendEmail({
    to,
    subject: '[AI Marketplace] 이메일 인증을 완료해 주세요',
    html,
    text,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string | null,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${resetToken}`;
  const userName = name || 'there';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    <div style="background: #3b82f6; color: white; padding: 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">비밀번호 재설정</h1>
    </div>
    
    <div style="padding: 30px;">
      <p>안녕하세요 ${userName}님,</p>
      
      <div style="background: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0;">
        <p style="margin: 0;">비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정하세요.</p>
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${resetUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          비밀번호 재설정
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">
        이 링크는 1시간 후에 만료됩니다. 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.
      </p>
      
      <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
        링크가 작동하지 않는 경우 아래 URL을 브라우저에 직접 붙여넣으세요:<br>
        <span style="word-break: break-all;">${resetUrl}</span>
      </p>
    </div>
    
    <div style="background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0;">© ${new Date().getFullYear()} AI Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
안녕하세요 ${userName}님,

비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 새 비밀번호를 설정하세요.

비밀번호 재설정: ${resetUrl}

이 링크는 1시간 후에 만료됩니다. 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.

---
© ${new Date().getFullYear()} AI Marketplace. All rights reserved.
  `;

  return sendEmail({
    to,
    subject: '[AI Marketplace] 비밀번호 재설정',
    html,
    text,
  });
}

export async function sendPasswordChangedEmail(
  to: string,
  name: string | null
): Promise<boolean> {
  const userName = name || 'there';
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    <div style="background: #ef4444; color: white; padding: 30px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">🔒</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">비밀번호가 변경되었습니다</h1>
    </div>
    
    <div style="padding: 30px;">
      <p>안녕하세요 ${userName}님,</p>
      
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 20px 0;">
        <p style="margin: 0;">회원님의 계정 비밀번호가 <strong>${timestamp}</strong>에 변경되었습니다.</p>
      </div>
      
      <p>본인이 변경한 것이 맞다면 이 이메일을 무시하셔도 됩니다.</p>
      
      <p style="color: #ef4444; font-weight: 500;">
        만약 비밀번호를 변경하지 않으셨다면, 즉시 비밀번호를 재설정하고 고객센터에 문의해 주세요.
      </p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${APP_URL}/forgot-password" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          비밀번호 재설정
        </a>
      </div>
    </div>
    
    <div style="background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0;">© ${new Date().getFullYear()} AI Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
안녕하세요 ${userName}님,

회원님의 계정 비밀번호가 ${timestamp}에 변경되었습니다.

본인이 변경한 것이 맞다면 이 이메일을 무시하셔도 됩니다.

만약 비밀번호를 변경하지 않으셨다면, 즉시 비밀번호를 재설정하고 고객센터에 문의해 주세요.

비밀번호 재설정: ${APP_URL}/forgot-password

---
© ${new Date().getFullYear()} AI Marketplace. All rights reserved.
  `;

  return sendEmail({
    to,
    subject: '[AI Marketplace] 비밀번호가 변경되었습니다',
    html,
    text,
  });
}

export async function sendNotificationEmail(
  to: string,
  name: string | null,
  type: string,
  title: string,
  message: string,
  link?: string
): Promise<boolean> {
  const userName = name || 'there';
  const fullLink = link ? `${APP_URL}${link}` : '';

  const buttonHtml = fullLink
    ? `
      <div style="margin: 30px 0; text-align: center;">
        <a href="${fullLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">
          자세히 보기
        </a>
      </div>
    `
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    <div style="background: #3b82f6; color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">${title}</h1>
    </div>
    
    <div style="padding: 30px;">
      <p>안녕하세요 ${userName}님,</p>
      
      <div style="background: #f9fafb; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0;">
        <p style="margin: 0;">${message}</p>
      </div>
      
      ${buttonHtml}
      
      <p style="color: #6b7280; font-size: 14px;">
        <a href="${APP_URL}/settings/notifications" style="color: #3b82f6;">알림 설정</a>에서 이메일 알림을 관리할 수 있습니다.
      </p>
    </div>
    
    <div style="background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0;">© ${new Date().getFullYear()} AI Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
안녕하세요 ${userName}님,

${title}

${message}

${fullLink ? `자세히 보기: ${fullLink}` : ''}

---
알림 설정 변경: ${APP_URL}/settings/notifications
© ${new Date().getFullYear()} AI Marketplace. All rights reserved.
  `;

  return sendEmail({
    to,
    subject: `[AI Marketplace] ${title}`,
    html,
    text,
  });
}
