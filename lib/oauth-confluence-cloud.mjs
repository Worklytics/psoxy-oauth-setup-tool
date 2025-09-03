import { OAuthAtlassianCloudHelper } from './oauth-atlassian-cloud.mjs';

const CONFLUENCE_SCOPE = 'offline_access read:blogpost:confluence read:comment:confluence read:group:confluence read:space:confluence read:attachment:confluence read:page:confluence read:user:confluence read:task:confluence read:content-details:confluence read:content:confluence';

class OAuthConfluenceCloudHelper extends OAuthAtlassianCloudHelper {
  constructor() {
    super({ scope: CONFLUENCE_SCOPE });
  }
}

export { OAuthConfluenceCloudHelper };
