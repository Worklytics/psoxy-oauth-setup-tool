import EventEmitter from 'events';
import { URLSearchParams } from 'url';
import express from 'express';
import { nanoid } from 'nanoid';
import { requestWrapper } from './utils.mjs';

/**
 * OAuth helper for Jira Cloud
 * @class
 * @extends EventEmitter
 */
class JiraCloudHelper extends EventEmitter {
  #port = 9000;
  #callbackPath = '/jira-cloud-callback';

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
    state: nanoid(10),
    response_type: 'code',
    prompt: 'consent',
  };

  constructor(options = {}) {
    super();
    this.options = {
      ...this.options,
      ...options,
    };
    this.app = express();
    this.app.get(this.#callbackPath, (req, res) =>
      this.authResponseHandler(req, res)
    );
  }

  async authCodeExchange(code) {
    const response = await requestWrapper(
      this.options.tokenURL,
      'POST',
      {
        'Content-Type': 'application/json',
      },
      JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.options.clientID,
        client_secret: this.options.clientSecret,
        code: code,
        redirect_uri: this.redirectURL,
      })
    );

    return JSON.parse(response.data);
  }

  async authResponseHandler(req, res) {
    const { code, state } = req.query;

    if (!code || state !== this.options.state) {
      res.send('Invalid request, please try again.');
      return;
    }

    const result = await this.authCodeExchange(code);
    let cloudIDResponse;
    if (result.access_token) {
      cloudIDResponse = await this.getCloudIDs(result.access_token);
    } else {
      throw 'No access token received';
    }

    res.send('OK; You may close this page now.');

    this.emit('authData', {
      ...this.options,
      ...result,
      cloudIDs: cloudIDResponse,
    });
  }

  getAuthURL(clientId, clientSecret, cloudInstanceURL) {
    this.options.clientID = clientId;
    this.options.clientSecret = clientSecret;
    this.options.cloudInstanceURL = cloudInstanceURL;

    const params = new URLSearchParams({
      audience: this.options.audience,
      client_id: this.options.clientID,
      scope: this.options.scope,
      redirect_uri: this.redirectURL,
      state: this.options.state,
      response_type: this.options.response_type,
      prompt: this.options.prompt,
    });

    return `${this.options.authorizationURL}?${params.toString()}`;
  }

  async getCloudIDs(accessToken) {
    const response = await requestWrapper(this.options.resourcesURL, 'GET', {
      Authorization: `Bearer ${accessToken}`,
    });
    return JSON.parse(response.data);
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.#port, () => {
        this.redirectURL = `http://localhost:${this.#port}${
          this.#callbackPath
        }`;
        resolve(this.redirectURL);
      });

      this.server.on('error', (error) => {
        reject(error);
      });
    });
  }

  stop() {
    this.server.close();
  }
}

export { JiraCloudHelper };
