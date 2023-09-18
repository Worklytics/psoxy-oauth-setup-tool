import EventEmitter from 'events';
import express from 'express';
import { nanoid } from 'nanoid';

/**
 * Abstract class for OAuth helpers
 */
class OAuthHelper extends EventEmitter {
  #port = 9000;
  #callbackPath = '/psoxy-setup-callback';

  options = {};

  constructor(options = {}) {
    super();

    if (this.constructor === OAuthHelper) {
      throw new Error('Cannot instantiate abstract class');
    }

    this.options = {
      ...this.options,
      ...options,
    };
    this.state = nanoid(10); // limit state string to 10 chars
    this.app = express();
    this.app.get(this.#callbackPath, (req, res) =>
      this.#authResponseHandler(req, res)
    );
  }

  async #authResponseHandler(req, res) {
    const { code, state } = req.query;
    if (!code || state !== this.state) {
      res.send('Invalid request, please try again.');
      return;
    }

    let resultMessage = 'OK; You may close this window now.';
    try {
      await this.authCodeExchange(code);
    } catch (error) {
      resultMessage = `Error: ${error.message}`;
    }

    res.send(resultMessage);
    this.emit('complete');
  }

  async authCodeExchange() {
    throw new Error('Method not implemented');
  }

  async authorize() {
    throw new Error('Method not implemented');
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

export { OAuthHelper };
