import { OAuthHelper } from './oauth.mjs';
import { requestWrapper } from './utils.mjs';
import { URLSearchParams } from 'url';
import open from 'open';
import chalk from 'chalk';

class OAuthJiraCloudHelper extends OAuthHelper {
  options = {
    authorizationURL: 'https://auth.atlassian.com/authorize',
    tokenURL: 'https://auth.atlassian.com/oauth/token',
    resourcesURL: 'https://api.atlassian.com/oauth/token/accessible-resources',
    // `offline_access` is required to obtain a "refresh token" along with the
    // "access token" in the exchange, but end-users don't have to register it
    // in the app settings as a scope
    scope:
      'offline_access read:group:jira read:avatar:jira read:user:jira read:account read:jira-user read:jira-work',
    audience: 'api.atlassian.com',
    responseType: 'code',
    prompt: 'consent',
  };

  async authCodeExchange(code) {
    const response = await requestWrapper(
      this.options.tokenURL,
      'POST',
      {
        'Content-Type': 'application/json',
      },
      JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        redirect_uri: this.redirectURL,
      })
    );

    const { access_token, refresh_token } = JSON.parse(response.data);

    const cloudIdResponse = await requestWrapper(
      this.options.resourcesURL,
      'GET',
      {
        Authorization: `Bearer ${access_token}`,
      }
    );
    // match the cloud instance URL with the one provided by the user
    const cloudId = JSON.parse(cloudIdResponse.data).filter(
      (instance) => instance.url === this.cloudURL
    )[0]?.id;

    this.emit('psoxysetupdata', {
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      accessToken: access_token,
      refreshToken: refresh_token,
      cloudId: cloudId,
    });
  }

  async authorize({ clientId, clientSecret, cloudURL }) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.cloudURL = cloudURL;

    const params = new URLSearchParams({
      audience: this.options.audience,
      client_id: this.clientId,
      scope: this.options.scope,
      redirect_uri: this.redirectURL,
      state: this.state,
      response_type: this.options.responseType,
      prompt: this.options.prompt,
    });

    const authURL = `${this.options.authorizationURL}?${params.toString()}`;

    console.log(
      `\nOpen this URL in your browser if it doesn't open automatically:
      ${chalk.blue(authURL)}`
    );

    await open(authURL);
  }
}

export { OAuthJiraCloudHelper };
