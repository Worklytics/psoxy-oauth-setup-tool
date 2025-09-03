import { OAuthAtlassianCloudHelper } from './oauth-atlassian-cloud.mjs';

const JIRA_SCOPE =
  'offline_access read:group:jira read:avatar:jira read:user:jira read:account read:jira-user read:jira-work';

class OAuthJiraCloudHelper extends OAuthAtlassianCloudHelper {
  constructor() {
    super({ scope: JIRA_SCOPE });
  }
}

export { OAuthJiraCloudHelper };
