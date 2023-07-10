import axios from "axios";

let token: { accessToken: string; expiresAt: number };

async function requestToken() {
  const res = await axios.post('https://mp.revival.com/ministryplatformapi/oauth/connect/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'http://www.thinkministry.com/dataplatform/scopes/all'
    }).toString(), {
    auth: {
      username: process.env.CLIENT_ID || '',
      password: process.env.CLIENT_SECRET || ''
    }
  });
  return {
    accessToken: res.data.access_token,
    expiresAt: Date.now() + res.data.expires_in * 1000
  };
}

export async function getAccessToken() {
  if (!token || token.expiresAt < Date.now()) {
    token = await requestToken();
  }

  return token.accessToken;
}
