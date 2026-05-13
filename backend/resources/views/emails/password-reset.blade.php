<!doctype html>
<html>
<body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:28px;">
      <h1 style="margin:0 0 12px;font-size:24px;">Reset your password</h1>
      <p style="margin:0 0 18px;line-height:1.6;">Hi {{ $name }},</p>
      <p style="margin:0 0 24px;line-height:1.6;">We received a request to reset your Shemachoch password. Use the button below to choose a new password.</p>
      <p style="margin:0 0 24px;">
        <a href="{{ $resetUrl }}" style="display:inline-block;background:#f59e0b;color:#0f172a;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">Reset password</a>
      </p>
      <p style="margin:0 0 12px;line-height:1.6;font-size:14px;color:#475569;">This link expires in 60 minutes. If you did not request this, you can ignore this email.</p>
      <p style="margin:0;line-height:1.6;font-size:13px;color:#64748b;">If the button does not work, open this link:<br>{{ $resetUrl }}</p>
    </div>
  </div>
</body>
</html>
