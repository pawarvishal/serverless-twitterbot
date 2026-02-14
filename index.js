'use strict';
const { KMSClient, DecryptCommand } = require('@aws-sdk/client-kms');
const { TwitterApi } = require('twitter-api-v2');

const kms = new KMSClient({});
const fnEncryptedConfig = process.env.FN_ENCRYPTED_CONFIG || ''; // encrypted base64 blob

let fnConfig;
let twitterClient;

function getDateParts() {
  const now = new Date();
  const day = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long'
  }).format(now);
  const dateandtime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(now);

  return { day, dateandtime };
}

async function loadConfig() {
  if (fnConfig) {
    return fnConfig;
  }

  if (!fnEncryptedConfig) {
    throw new Error('Missing FN_ENCRYPTED_CONFIG environment variable');
  }

  const decrypted = await kms.send(new DecryptCommand({
    CiphertextBlob: Buffer.from(fnEncryptedConfig, 'base64')
  }));

  fnConfig = JSON.parse(Buffer.from(decrypted.Plaintext).toString('utf8'));
  return fnConfig;
}

async function getTwitterClient() {
  if (twitterClient) {
    return twitterClient;
  }

  const cfg = await loadConfig();
  const requiredKeys = ['consumer_key', 'consumer_secret', 'access_token_key', 'access_token_secret'];
  const missingKeys = requiredKeys.filter((key) => !cfg[key]);

  if (missingKeys.length > 0) {
    throw new Error('Missing required Twitter config keys: ' + missingKeys.join(', '));
  }

  twitterClient = new TwitterApi({
    appKey: cfg.consumer_key,
    appSecret: cfg.consumer_secret,
    accessToken: cfg.access_token_key,
    accessSecret: cfg.access_token_secret
  });

  return twitterClient;
}

async function processEvent() {
  console.log('processEvent started');

  const client = await getTwitterClient();
  const dateParts = getDateParts();
  const status = 'Its ' + dateParts.day + ', ' + dateParts.dateandtime + ' IST, Hello People! Happy tweeting!';

  await client.readWrite.v2.tweet(status);
  console.log('tweet sent ' + dateParts.dateandtime);
}

exports.handler = async (event, context, callback) => {
  try {
    await processEvent(event, context);
    if (typeof callback === 'function') {
      callback(null, 'function executed successfully');
      return;
    }
    return 'function executed successfully';
  } catch (err) {
    console.error('handler error:', err);
    if (typeof callback === 'function') {
      callback(err);
      return;
    }
    throw err;
  }
};
