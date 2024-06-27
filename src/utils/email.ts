import { activationEmail } from './emailTemplates';
import 'dotenv/config';

const domain = "noreply.skyproton.com";

export const sendActivationEmail = async (to: string, token: string) => {
    const apiEndpoint = `https://api.mailgun.net/v3/${domain}/messages`;

    const reqHeaders = new Headers();
    reqHeaders.append('Authorization', `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`);

    const formdata = new FormData();
    formdata.append("from", "SkyProton <postmaster@noreply.skyproton.com>");
    formdata.append("to", to);
    formdata.append("subject", "Please activate your account!");
    formdata.append("text", "Please activate your account!");
    formdata.append("html", activationEmail(`${process.env.BACKEND_URL}/user/activate/${to}/${token}`));

    const requestOptions = {
        method: 'POST',
        headers: reqHeaders,
        body: formdata,
    };

    try {
        const response = await fetch(apiEndpoint, requestOptions);
        const result = await response.text();
        if (result) return true;
        return false;
    } catch (error) {
        console.error(error);
        return false;
    };
}
