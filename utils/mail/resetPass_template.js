const resetPass = (data) => {
    return `
    <!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Demystifying Email Design</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style type="text/css">
        @media screen and (max-width: 550px) {
            .table-wrapper {
                width: 100% !important;
            }
        }
    </style>
</head>

<body style="margin: 0; padding: 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td style="padding: 20px 0 30px 0;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" class="table-wrapper"
                    style="border-collapse: collapse;">
                    <tr>
                        <td align="center" bgcolor="#FF4747"
                            style="padding: 20px 0 20px 0;color:#fff;font-size: 20px;font-family: Arial, sans-serif;">
                            <b>Trouble signing in?</b>
                        </td>
                    </tr>
                </table>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" class="table-wrapper"
                    style="border-collapse: collapse;">
                    <tr>
                        <td bgcolor="#ffffff"
                            style="padding: 20px 20px 20px 20px;color:#444444;font-size: 15px;font-family: Arial, sans-serif;line-height: 20px;">
                            <b>There is a request to change your password. Resetting your password is easy. Just press the button below and follow the instructions. We'll have you up and running in no time.</b>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" bgcolor="#ffffff" style="padding: 20px 0 20px 0;">
                            <a href="http://localhost:3000/reset_password/${data.resetToken}"
                                style="background: #FF4747;color:#ffffff;border:none;font-family: Arial, sans-serif; font-size: 14px;padding: 10px 18px 10px 18px;text-decoration: none;">Reset Password</a>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff"
                            style="padding: 20px 20px 20px 20px;color:#444444;font-size: 15px;font-family: Arial, sans-serif;line-height: 20px;">
                            If you did not make this request, just ignore this email. Otherwise, pleas click button above to change your password.<br /><br />
                            Cheers, <br />
                            The Nepscart Team
                        </td>
                    </tr>
                    <tr>
                        <td align="center" bgcolor="#f9f9f9"
                            style="padding: 20px 0 20px 0;font-family: Arial, sans-serif;font-size: 14px;color:#444444;">
                            Need more help? <br />
                            <a href="http://nepscart.com/contactus"
                                style="color:#FF4747;border:none;font-family: Arial, sans-serif; font-size: 14px;">We’re
                                here, ready to talk</a>
                        </td>
                    </tr>
                </table>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" class="table-wrapper"
                    style="border-collapse: collapse;">
                    <tr>
                        <td bgcolor="#ff9a00" align="center"
                            style="padding: 20px 20px 20px 20px;color: #ffffff;font-family: Arial, sans-serif; font-size: 14px;line-height: 20px;">
                            &reg; Nepscart, somewhere 2017<br />
                            You received this email because it seems you forgot your password. 
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
    `
}

module.exports = {resetPass}