import {
  IntegrationExecutionContext,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from './client';
import { IntegrationConfig } from './types';

export default async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { config } = context.instance;

  //Only need the Api key here
  if (!config.clientApiKey) {
    throw new IntegrationValidationError(
      'Config requires all of {clientApiKey}',
    );
  }

  const apiClient = createAPIClient(config);
  await apiClient.verifyAuthentication();
}
