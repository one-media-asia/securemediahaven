export type CognitoSignupInput = {
  name: string;
  email: string;
  password: string;
};

export type CognitoSignupResult = {
  userSub?: string;
  userConfirmed: boolean;
};

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

export const isCognitoConfigured = () => Boolean(userPoolId && clientId);

const getUserPool = async () => {
  if (!userPoolId || !clientId) {
    throw new Error('Cognito is not configured. Add the User Pool ID and App Client ID.');
  }

  const cognito = await import('amazon-cognito-identity-js');
  return new cognito.CognitoUserPool({ UserPoolId: userPoolId, ClientId: clientId });
};

export const signUpWithCognito = async (input: CognitoSignupInput): Promise<CognitoSignupResult> => {
  // This legacy SDK expects Node's global variable when it initializes in a browser.
  if (!('global' in globalThis)) {
    Object.defineProperty(globalThis, 'global', { value: globalThis, configurable: true });
  }

  const { CognitoUserAttribute } = await import('amazon-cognito-identity-js');
  const userPool = await getUserPool();
  const username = `vaultline_${crypto.randomUUID().replaceAll('-', '')}`;
  const attributes = [
    new CognitoUserAttribute({ Name: 'email', Value: input.email.trim().toLowerCase() }),
    new CognitoUserAttribute({ Name: 'name', Value: input.name.trim() }),
    new CognitoUserAttribute({ Name: 'preferred_username', Value: username }),
    new CognitoUserAttribute({ Name: 'website', Value: 'https://onemedia.asia' }),
  ];

  return new Promise((resolve, reject) => {
    userPool.signUp(username, input.password, attributes, [], (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        userSub: result?.userSub,
        userConfirmed: result?.userConfirmed ?? false,
      });
    });
  });
};
