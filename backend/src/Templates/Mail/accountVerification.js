export default (username, otp) =>
    `
    <!Doctype>
    <html lang="en">
    <title>Account Verification Email</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width initial-scale=0.5">
    <style type="text/css"></style>
    </head>

    <body>
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                    <a href="${process.env.FRONTEND_URL}" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">IS Media</a>
                </div>
                    <p style="font-size:1.1em">Hello there, <b>${username}</b></p>
                    <p>Thank you for using IS Media. Use the following OTP to complete your account verification. OTP is valid for 15 minutes</p>
                    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                    <p style="font-size:0.9em;">Regards,<br />IS Media</p>
                    <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                    <p>IS Media © 2024</p>
                </div>
            </div>
        </div>
    </body>

    </html>
    `;