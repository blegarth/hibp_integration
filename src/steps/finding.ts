import {
  createDirectRelationship,
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../types';
import { entities, relationships } from '../constants';
import { getEmailKey } from './email';
import { getBreachKey } from './breach';

export function getFindingKey(name: string, email: string): string {
  return `${name}: ${email}`;
}

export async function fetchFindings({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);
  await apiClient.iterateFindings(async (finding) => {
    const jobs: Promise<any>[] = [];

    const findingEntity = createIntegrationEntity({
      entityData: {
        source: finding,
        assign: {
          //Should have used an id for this but
          //I didnt know how to search through and
          //entity
          _key: getFindingKey(finding.name, finding.email),
          _type: entities.FINDING._type,
          _class: entities.FINDING._class,
          id: `${finding.email}`,
          name: finding.email,
          category: 'email',
          severity: 'high',
          open: true,
        },
      },
    });
    jobs.push(jobState.addEntity(findingEntity));

    const emailEntity = await jobState.findEntity(getEmailKey(finding.email));
    if (emailEntity) {
      jobs.push(
        jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: emailEntity,
            to: findingEntity,
          }),
        ),
      );
    }

    const breachEntity = await jobState.findEntity(getBreachKey(finding.name));
    if (breachEntity) {
      jobs.push(
        jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: breachEntity,
            to: findingEntity,
          }),
        ),
      );
    }

    await Promise.all(jobs);
  });
}

export const findingSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-finding',
    name: 'Fetch Findings',
    entities: [entities.FINDING],
    relationships: [
      relationships.EMAIL_HAS_FINDING,
      relationships.BREACH_HAS_FINDING,
    ],
    dependsOn: ['fetch-email', 'fetch-breach'],
    executionHandler: fetchFindings,
  },
];
