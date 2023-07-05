import https from 'https';
import chalk from 'chalk';

const REQUEST_TIMEOUT_MS = 5000;
/**
 * Wrapper for requests using Node.js HTTP interfaces
 *
 * @param {string|URL} url
 * @param {object} headers
 * @param {string} method
 * @param {object} data
 * @return {Promise}
 */
function requestWrapper(url, method = 'GET', headers, data) {
  url = typeof url === 'string' ? new URL(url) : url;
  const params = url.searchParams.toString();
  let responseData = '';

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.host,
        port: 443,
        path: url.pathname + (params !== '' ? `?${params}` : ''),
        method: method,
        headers: headers,
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        res.on('data', (data) => (responseData += data));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            data: responseData,
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject({ statusMessage: 'Server is taking too long to respond' });
    });

    req.on('error', (error) => {
      reject({ status: error.code, statusMessage: error.message });
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

/**
 * Print the result of the 3LO process
 * @param {string} prefix Identifies the tool
 * @param {Object} data
 * @param {string} data.clientId
 * @param {string} data.clientSecret
 * @param {string} data.cloudId Optional, only present for Jira Cloud
 * @param {string} data.accessToken
 * @param {string} data.refreshToken
 */
function printPsoxySetupData(prefix = '', data = {}) {
  const psoxyValuesTmpl = `
    Using the following values for your ${chalk.blue(
      'Worklytics Psoxy configuration'
    )} (AWS System Manager store / GCP Cloud secrets):\n
${chalk.green(`PSOXY_${prefix}_ACCESS_TOKEN`)}: ${data.accessToken}\n
${chalk.green(`PSOXY_${prefix}_REFRESH_TOKEN`)}: ${data.refreshToken}\n
${chalk.green(`PSOXY_${prefix}_CLIENT_ID`)}: ${data.clientId}\n
${chalk.green(`PSOXY_${prefix}_CLIENT_SECRET`)}: ${data.clientSecret}
  `;

  console.log('\n');
  console.log(psoxyValuesTmpl.trim());

  if (data.cloudId) {
    // Jira Cloud specific use-case
    const terraformValueTmpl = `
      Use the following value in your Terraform configuration:\n\n${chalk.blue(
        'jira_cloud_id'
      )} = ${data.cloudId}
    `;
    console.log('\n');
    console.log(terraformValueTmpl.trim());
  }
}

export { requestWrapper, printPsoxySetupData };
