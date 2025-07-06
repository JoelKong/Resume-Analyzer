import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

export default async () => {
  const isProduction = ['production', 'uat'].includes(
    process.env.NODE_ENV ?? '',
  );
  const envKeys = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
    'PORT',
  ];

  const config = envKeys.reduce(
    (acc, key) => {
      acc[key] = process.env[key];
      return acc;
    },
    {} as { [key: string]: string | undefined },
  );

  if (isProduction) {
    const secretName = process.env.SECRET_NAME;
    if (!secretName) {
      throw new Error(
        'SECRET_NAME environment variable is not set for production environment.',
      );
    }

    const client = new SecretsManagerClient();
    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const data = await client.send(command);

      if (data.SecretString) {
        const secrets = JSON.parse(data.SecretString);
        Object.assign(config, secrets);
      }
    } catch (error) {
      console.error('Failed to fetch secrets from AWS Secrets Manager:', error);
      throw error;
    }
  }

  return config;
};
