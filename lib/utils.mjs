import https from 'https';

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

export { requestWrapper };
