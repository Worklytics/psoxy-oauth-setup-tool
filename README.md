# Worklytics Psoxy OAuth setup tool

This tool helps you to set up and configure your [Worklytics Psoxy] instances 
to work with the following data sources: 

- GitHub
- Jira Cloud

To be able to complete your Worklytics Psoxy deployment you need an 
`access_token` and a `refresh_token` that your Psoxy will use to fetch data 
from those sources. 

Both data sources work in a similar way, to get these tokens you need to create 
an OAuth 2.0 integration in your Jira Cloud instance (or GitHub account) with 
the appropriate permissions (scopes), perform an authentication flow
and then an authorization flow to finally get the tokens. 

As we explain in the [Worklytics Psoxy documentation] (Jira Cloud use-case) 
this process can be a bit tricky and time-consuming if done manually. Since 
Jira Cloud uses OAuth 2.0 (3LO), by running this tool, you will be able to 
complete the authentication and authorization flows from the command line, and 
get the tokens and other values you need to complete your Psoxy deployment configuration as output.

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
npx psoxy-setup-oauth-tool
```

[Worklytics Psoxy]: https://github.com/Worklytics/psoxy
[Worklytics Psoxy documentation]: https://github.com/Worklytics/psoxy/blob/main/docs/sources/atlassian/jira-cloud.md
