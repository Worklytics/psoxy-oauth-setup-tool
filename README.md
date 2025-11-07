# Worklytics Pseudonymizing Proxy – OAuth Setup Tool

This tool helps you set up and configure your [Worklytics Pseudonymizing Proxy] instances
to work with the following data sources:
 - Atlassian Confluence Cloud
 - Atlassian Jira Cloud
 - GitHub

To complete your Worklytics Proxy deployment, you need secret values such as an access_token and a refresh_token, or a client_id and client_secret. These values allow your Psoxy to fetch data from those sources.

All these data sources use a similar process. To obtain the tokens, you must create an OAuth 2.0 integration in your Jira/Confluence Cloud instance (or GitHub account) with the proper permissions (scopes). Then, you perform an authentication flow followed by an authorization flow to get the tokens.

As explained in the [Worklytics Proxy documentation] (Jira/Confluence Cloud use case), this process can be tricky and time-consuming if done manually. Because Jira/Confluence Cloud uses OAuth 2.0 (3LO), running this tool lets you complete both the authentication and authorization flows from the command line. It then outputs the tokens and other values you need to finish your Worklytics Proxy deployment configuration.

## Install

Prerequisites: Node.js >= 18, NPM >= 8. 
Install it with [npm](https://www.npmjs.com/):

Since this tool works interactively, is intended to be executed directly from 
the command line, and it's not appropriate to add it as a dependency to your 
project. We recommend to install it globally:

```shell
npm install git+https://github.com/Worklytics/psoxy-oauth-setup-tool -g
```

## Usage

Run the tool and answer the questions you'll be prompted with (such as the Jira 
Cloud Client ID value of the OAuth integration you've created):

```shell
npx psoxy-oauth-setup-tool
```

## Development

You can also run the tool directly from your local clone:

1. Clone the repository:
   ```shell
   git clone https://github.com/Worklytics/psoxy-oauth-setup-tool.git
   cd psoxy-oauth-setup-tool
   ```

2. Install dependencies:
   ```shell
   npm install
   ```

3. Run the tool:
   ```shell
   node index.mjs
   ```

[Worklytics Pseudonymizing Proxy]: https://docs.worklytics.co/psoxy
[Worklytics Proxy documentation]: https://docs.worklytics.co/psoxy/sources/atlassian/jira