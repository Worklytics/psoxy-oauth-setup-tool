import { OAuthHelper } from './oauth.mjs';
import { nanoid } from 'nanoid';
import { requestWrapper } from './utils.mjs';
import { URLSearchParams } from 'url';
import open from 'open';
import chalk from 'chalk';

class OAuthGitHubHelper extends OAuthHelper {
  options = {
    authorizationURL: 'https://github.com/login/oauth/authorize',
    tokenURL: 'https://github.com/login/oauth/access_token',
    state: nanoid(10),
  };

  async authCodeExchange(code) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
    });
    const response = await requestWrapper(
      `${this.options.tokenURL}?${params.toString()}`,
      'POST'
    );

    const { access_token, refresh_token } = response.data
      .split('&')
      .reduce((acc, cur) => {
        const [key, value] = cur.split('=');
        acc[key] = value;
        return acc;
      }, {});

    this.emit('psoxysetupdata', {
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      accessToken: access_token,
      refreshToken: refresh_token,
    });
  }

  async authorize({ clientId, clientSecret }) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectURL,
      state: this.state,
    });

    const authURL = `${this.options.authorizationURL}?${params.toString()}`;

    console.log(
      `\nOpen this URL in your browser if it doesn't open automatically:
      ${chalk.blue(authURL)}`
    );

    await open(authURL);
  }
}

export { OAuthGitHubHelper };
