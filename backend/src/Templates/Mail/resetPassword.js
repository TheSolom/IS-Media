export default (username, resetUrl) =>
    `
    <!Doctype>
    <html lang="en">
    <title>Password Reset Email</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width initial-scale=0.5">
    <style type="text/css">
        /* client specific styles*/
        /* Reset CSS styles */
        .txt-color:hover {
            color: #ed0e0e !important;
        }

        .bg-rollover:hover {
            background-color: #ed0e0e !important;
        }

        /*Mobile styles */
    </style>
    </head>

    <body style="background-color: #53565e">
        <!-- start of header table -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F2f1f1">
            <tr>
                <td align="center">
                    <!-- start of logo wrapper -->
                    <table width="600px" border="0" cellpadding="0" cellspacing="0" style="background-color: #F2f1f1">
                        <tr>
                            <td align="center" style="padding: 5px 0 5px 0">
                                <img src="https://res.cloudinary.com/dyr6ziunz/image/upload/v1719427509/SocialMedia/Website%20assets/IS-Media-logo.png"
                                    width="100" alt="IS media"
                                    style="display: block; border-radius: 3px; width: 100%; max-width: 100px" border="0">

                            </td>
                        </tr>
                    </table>
                    <!-- end of logo wrapper -->
                </td>
            </tr>
        </table>
        <!-- end of header table -->
        <!-- start of body table -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#F2f1f1">
            <tr>
                <td align="center">
                    <!-- start of body wrapper -->
                    <table width="600px" border="0" cellpadding="0" cellspacing="0" style="background-color: #F6F6F6">
                        <tr>
                            <td align="center">
                                <h1 style="font-size: 30px; font-weight: normal; padding: 0 0 10px 0">
                                    Password Reset
                                </h1>

                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0 8px 10px 8px; font-size: 17px">Hello, <b>${username}</b> Seems like you forgot your password for
                                <b>
                                    <a href="${process.env.FRONTEND_URL}" style="color:#4d4f51; text-decoration:none;">
                                        <span class="txt-color">IS Media</span>
                                    </a>
                                </b>
                                . Please click below to reset your password.
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center">
                                            <table border="0" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td class="bg-rollover" bgcolor="#6495ED"
                                                        style=" padding: 12px 18px 12px 18px; border-radius: 3px">
                                                        <a id="reset-url" href="${resetUrl}"
                                                            style="color: white; text-decoration: none;">
                                                            Reset MyPassword
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 8px; font-size: 17px">If you did not forgot your password, please
                                ignore this email and have a lovely day.</td>
                        </tr>
                    </table>
                    <!-- end of body wrapper -->
                </td>
            </tr>
        </table>
        <!-- end of body table -->

        <!-- start of footer table -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F2f1f1">
            <tr>
                <td align="center">
                    <!-- start of footer wrapper -->
                    <table width="600px" border="0" cellpadding="0" cellspacing="0" style="background-color:#F2f1f1">
                        <tr>
                            <td align="center" style="padding: 0 0 5px 0; font-size: 13px;">
                                <span style="color: #b3b4b5">IS Media © 2024</span>
                            </td>
                        </tr>

                    </table>
                    <!-- end of footer wrapper --->
                </td>
            </tr>
        </table>
        <!-- end of footer table -->
    </body>

    </html>
`;