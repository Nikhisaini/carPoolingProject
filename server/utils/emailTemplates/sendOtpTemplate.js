const sendOtpTemplate = ({ name, otp }) => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Email Verification</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;padding:40px;">
<tr>
<td align="center">
<h2>BlaBlaCar</h2>
</td>
</tr>
<tr>
<td>
<h3>Hello ${name},</h3>
<p>
Thank you for registering with BlaBlaCar.
</p>
<p>
Please use the OTP below to verify your email.
</p>
<div
style="
background:#f5f5f5;
padding:20px;
text-align:center;
font-size:32px;
font-weight:bold;
letter-spacing:8px;
border-radius:8px;
margin:30px 0;
"
>
${otp}
</div>
<p>
This OTP is valid for <strong>10 minutes</strong>.
</p>
<p>
If you did not create an account, you can safely ignore this email.
</p>
<br>

<p>Regards,</p>
<p><strong>BlaBlaCar Team</strong></p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`;
};

export default sendOtpTemplate;
