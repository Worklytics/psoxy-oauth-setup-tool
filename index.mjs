import enquirer from 'enquirer';
import { printPsoxySetupData } from './lib/utils.mjs';
import { OAuthJiraCloudHelper } from './lib/oauth-jira-cloud.mjs';
import { OAuthGitHubHelper } from './lib/oauth-github.mjs';
import chalk from 'chalk';
import { URL } from 'url';

const end = (instance) => {
  instance.stop();
  process.exit(0);
};

async function processJiraCloud() {
  const jira = new OAuthJiraCloudHelper();
  jira.on('psoxysetupdata', (data) => {
    printPsoxySetupData('JIRA_CLOUD', data);
  });
  jira.on('complete', () => end(jira));

  const oauthRedirectURL = await jira.start();

  const installAppMessage = `
    Please, create a new OAuth 2.0 App (3LO) in your Jira Cloud instance (or use and existing one) and enter the following value in the ${chalk.bold(
      'Callback URL'
    )} field: ${chalk.blue.bold(oauthRedirectURL)}
  `;
  console.log(`\n${chalk.bold(installAppMessage.trim())}`);
  const confirmPrompt = new enquirer.Confirm({
    message: `Have you registered the Callback URL?`,
  });

  const confirmation = await confirmPrompt.run();
  if (!confirmation) {
    end(jira);
  }

  console.log(
    `${chalk.green('OK')}: Please, enter the following settings of your App:`
  );
  // Enquirer's Snippet could replace these one by one prompts but it
  // doesn't support "pasting" (bad UX for IDs and secrets)
  // https://github.com/enquirer/enquirer/issues/165
  const cloudURLPrompt = new enquirer.Input({
    message:
      'URL of your Jira Cloud instance (e.g. https://mycompany.atlassian.net)',
    required: true,
    validate(value) {
      try {
        new URL(value);
      } catch (err) {
        return cloudURLPrompt.styles.danger('cloudURL should be a valid URL');
      }
      return true;
    },
  });
  const cloudURL = await cloudURLPrompt.run();

  const clientId = await new enquirer.Input({
    message: 'Client ID',
    required: true,
  }).run();

  // Not using a "password" type prompt since this is intended to be run locally
  // and the user will get the secret back as output
  const clientSecret = await new enquirer.Input({
    message: 'Client Secret',
    required: true,
  }).run();

  await jira.authorize({
    clientId: clientId,
    clientSecret: clientSecret,
    cloudURL: cloudURL,
  });
}

async function processGitHub() {
  const github = new OAuthGitHubHelper();
  github.on('psoxysetupdata', (data) => {
    printPsoxySetupData('GITHUB', data);
  });
  github.on('complete', () => end(github));

  const oauthRedirectURL = await github.start();

  const installAppMessage = `
    Please, create a new GitHub App in your GitHub's organization (or use and existing one) and enter the following value in the ${chalk.bold(
      'Callback URL'
    )} field: ${chalk.blue.bold(oauthRedirectURL)}
  `;
  console.log(`\n${chalk.bold(installAppMessage.trim())}`);
  const confirmPrompt = new enquirer.Confirm({
    message: `Have you registered the Callback URL?`,
  });

  const confirmation = await confirmPrompt.run();
  if (!confirmation) {
    end(github);
  }

  console.log(
    `${chalk.green(
      'OK'
    )}: Please, enter the following settings of your GitHub App:`
  );
  const clientId = await new enquirer.Input({
    message: 'Client ID',
    required: true,
  }).run();

  const clientSecret = await new enquirer.Input({
    message: 'Client Secret',
    required: true,
  }).run();

  await github.authorize({
    clientId: clientId,
    clientSecret: clientSecret,
  });
}

const toolChoice = await new enquirer.Select({
  message: 'Select the tool you want to configure in your Psoxy instance',
  choices: ['Jira Cloud', 'GitHub'],
}).run();

switch (toolChoice) {
  case 'Jira Cloud':
    processJiraCloud();
    break;
  case 'GitHub':
    processGitHub();
    break;
}
