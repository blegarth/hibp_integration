import fetch, { Response } from 'node-fetch';

import { IntegrationProviderAuthenticationError } from '@jupiterone/integration-sdk-core';

import { IntegrationConfig, HibpBreach, Finding } from './types';
import { emails } from './instanceConfigFields';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

/**
 * An APIClient maintains authentication state and provides an interface to
 * third party data APIs.
 *
 * It is recommended that integrations wrap provider data APIs to provide a
 * place to handle error responses and implement common patterns for iterating
 * resources.
 */
export class APIClient {
  private readonly clientApiKey: string;

  constructor(readonly config: IntegrationConfig) {
    this.clientApiKey = config.clientApiKey;
  }

  private withBaseUri(path: string): string {
    return `https://haveibeenpwned.com/api/v3/${path}`;
  }

  //Decided to go with the requeest here because it was closer
  //to what i knew
  private async request(
    uri: string,
    method: 'GET' | 'HEAD' = 'GET',
    body?: any,
  ): Promise<Response> {
    return await fetch(uri, {
      method,
      headers: {
        Accept: 'application/json',
        'hibp-api-key': `${this.clientApiKey}`,
        'Content-Type': 'application/json',
      },
      body: body || null,
    });
  }

  public async verifyAuthentication(): Promise<void> {
    //tests by getting one breach
    const response = await this.request(this.withBaseUri('breaches?limit=1'));

    if (!response.ok) {
      throw new IntegrationProviderAuthenticationError({
        cause: new Error('Provider authentication failed.'),
        endpoint: 'https://haveibeenpwned.com/api/v3/breaches?limit=1',
        status: response.status,
        statusText: response.statusText,
      });
    }
  }

  /**
   * Iterates each user breach from the HIBP website.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateBreaches(
    iteratee: ResourceIteratee<HibpBreach>,
  ): Promise<void> {
    const response = await this.request(this.withBaseUri('breaches'));

    //This was a lot more straight forward than the Findings because
    //I knew what was going to show in the response
    const breaches: HibpBreach[] = await response.json();

    for (const breach of breaches) {
      await iteratee(breach);
    }
  }

  /**
   * Iterates each finding. I wasn't really sure what a finding was
   * so I set it to be each time the email address has been pwned
   * and used the email address for the API calls
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateFindings(
    iteratee: ResourceIteratee<Finding>,
  ): Promise<void> {
    for (const new_email of emails) {
      const response = await this.request(
        this.withBaseUri(`breachedaccount/${new_email.name}`),
      );
      //this is needed because one of the emails did not have
      //any breaches
      if (response.ok) {
        const breaches: Map<string, string>[] = await response.json();
        for (let [_, value] of Object.entries(breaches)) {
          const name: string = value['Name'];
          //Changed it back to non url encoded email for better readibility
          const email: string = new_email.name.replace('%40', '@');
          //Made the finding more consistent with what the email
          //entity would show
          let newBreachFinding: Finding = { email, name };
          await iteratee(newBreachFinding);
        }
      }
    }
  }
}

export function createAPIClient(config: IntegrationConfig): APIClient {
  return new APIClient(config);
}
