import enquirer from 'enquirer';
import chalk from 'chalk';
import open from 'open';
import { JiraCloudHelper } from './lib/oauth.mjs';

const jiraCloudHelper = new JiraCloudHelper();
jiraCloudHelper.on('authData', (data) => {
  // TODO improve output and add option to save to file
  console.log(
    `\n\nUse these values for your ${chalk.blue(
      'Worklytics Psoxy configuration'
    )} (AWS System Manager store / GCP Cloud secrets):`
  );
  console.log(`
    ${chalk.green('PSOXY_JIRA_CLOUD_ACCESS_TOKEN')}: ${data.access_token}
    ${chalk.green('PSOXY_JIRA_CLOUD_REFRESH_TOKEN')}: ${data.refresh_token}
    ${chalk.green('PSOXY_JIRA_CLOUD_CLIENT_ID')}: ${data.clientID}
    ${chalk.green('PSOXY_JIRA_CLOUD_CLIENT_SECRET')}: ${data.clientSecret}
  `);

  const cloudID = data.cloudIDs.filter(
    (item) => item.url === data.cloudInstanceURL
  )[0].id;

  console.log(
    `Terraform configuration, ${chalk.blue('jira_cloud_id')} = ${cloudID}`
  );

  jiraCloudHelper.stop();
  process.exit(0);
});
const oauthRedirectURL = await jiraCloudHelper.start();

const confirmPrompt = new enquirer.Confirm({
  message: `Do you already have an OAuth 2.0 integration registered in Jira Cloud instance?`,
});
const existingApp = await confirmPrompt.run();

const nextStepMessage = existingApp
  ? `Please, in the "Authorization" section of your application configuration, enter the following value in the ${chalk.bold(
      'Callback URL'
    )} field: ${chalk.blue.bold(oauthRedirectURL)}`
  : // TODO complete instructions based on Psoxy sources documentation
    `Please register a new OAuth 2.0 integration in your Jira Cloud account`;
console.log(`${chalk.green('OK')}: ${nextStepMessage}`);

const cloudInstanceURL = await new enquirer.Input({
  message:
    'Enter the URL of your Jira Cloud instance (e.g. https://mycompany.atlassian.net)',
}).run();

const clientID = await new enquirer.Input({
  message: 'Enter the Client ID',
}).run();

// Not using a "password" type prompt since this is intended to be run locally
// and the user will get this value back as output
const clientSecret = await new enquirer.Input({
  message: 'Enter the Client Secret',
}).run();

const authURL = jiraCloudHelper.getAuthURL(
  clientID,
  clientSecret,
  cloudInstanceURL
);

console.log(
  `\nOpen this URL in your browser if it doesn't open automatically:\n${authURL}`
);

await open(authURL, { app: { name: 'google chrome' } });
