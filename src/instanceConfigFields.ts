import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk-core';
import { EmailAddress } from './types';

/**
 * A type describing the configuration fields required to execute the
 * integration for a specific account in the data provider.
 *
 * When executing the integration in a development environment, these values may
 * be provided in a `.env` file with environment variables. For example:
 *
 * - `CLIENT_ID=123` becomes `instance.config.clientId = '123'`
 * - `CLIENT_SECRET=abc` becomes `instance.config.clientSecret = 'abc'`
 *
 * Environment variables are NOT used when the integration is executing in a
 * managed environment. For example, in JupiterOne, users configure
 * `instance.config` in a UI.
 */
const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  clientApiKey: {
    type: 'string',
  },
};

export default instanceConfigFields;

//Test emails that I will be using for the program
export const emails: EmailAddress[] = [
  {
    id: '1',
    name: 'legarth7%40gmail.com',
  },
  {
    id: '2',
    name: 'plegarth%40gmail.com',
  },
  {
    id: '3',
    name: 'legarthb20%40gmail.com',
  },
  {
    id: '4',
    name: 'legarth8%40gmail.com',
  },
];
