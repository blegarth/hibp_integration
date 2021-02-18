import {
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../types';
import { entities } from '../constants';

export function getBreachKey(name: string): string {
  return `breach_identifier:${name}`;
}

export async function fetchBreaches({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);
  await apiClient.iterateBreaches(async (breach) => {
    const jobs: Promise<any>[] = [];
    const breachEntity = createIntegrationEntity({
      entityData: {
        source: breach,
        assign: {
          //wasnt sure how to get around the id in the limited
          //time would have definitely set this to id
          _key: getBreachKey(breach['Name']),
          _type: entities.BREACH._type,
          _class: entities.BREACH._class,
          id: `${breach['Name']}`,
          name: breach['Name'],
        },
      },
    });
    jobs.push(jobState.addEntity(breachEntity));

    await Promise.all(jobs);
  });
}

export const breachSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-breach',
    name: 'Fetch Breaches',
    entities: [entities.BREACH],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchBreaches,
  },
];
