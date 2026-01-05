export const emailVerificationApproval = async ({
  message,
  title = `Company-Approval`,
}: { message?: string; title?: string } = {}) => {
  await Promise.resolve();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #569d3cff, #6f1546ff);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #fff;
    }

    .container {
      max-width: 600px;
      margin: 60px auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
      padding: 50px 35px;
      text-align: center;
      color: #333;
    }

    h1 {
      color: #0d47a1;
      font-size: 28px;
      margin-bottom: 15px;
    }

    p {
      color: #555;
      font-size: 16px;
      margin-bottom: 30px;
    }

    .message-box {
    background: #f5f9ff;
    border-left: 6px solid #427ef5;
    padding: 20px 24px;
    border-radius: 10px;
    color: #333;
    font-size: 16px;
    line-height: 1.6;
    text-align: left;
    margin: 30px 0;
  }

    .note {
      font-size: 14px;
      color: #777;
      margin-top: 20px;
    }

    .footer {
      font-size: 13px;
      color: #aaa;
      margin-top: 40px;
    }

    @media (max-width: 600px) {
      .container {
        margin: 20px;
        padding: 30px 20px;
      }

      .otp-box {
        font-size: 26px;
        letter-spacing: 8px;
        padding: 15px 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
      <p style="
      color:#555;
      font-size:16px;
      margin-bottom:25px;
    ">
    
      Welcome to a professional experience with <strong>${process.env.APPLICATION_NAME}</strong>.
    </p>

    <div class="message-box">Great!🎉<br>${message}</div>

    <div class="footer">
      &copy; 2025 My Company. All rights reserved.
    </div>
  </div>
</body>
</html>`;
};