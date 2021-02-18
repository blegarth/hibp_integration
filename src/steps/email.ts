import {
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { entities } from '../constants';

import { emails } from '../instanceConfigFields';

export function getEmailKey(name: string): string {
  return `email_address:${name}`;
}

export async function fetchEmailDetails({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const jobs: Promise<any>[] = [];
  for (const email of emails) {
    const userEntity = createIntegrationEntity({
      entityData: {
        source: {
          id: email.id,
          name: email.name,
        },
        assign: {
          //Makes the email more readable
          _key: getEmailKey(email.name.replace('%40', '@')),
          _type: entities.EMAIL._type,
          _class: entities.EMAIL._class,
          email: email.name,
        },
      },
    });
    jobs.push(jobState.addEntity(userEntity));
  }

  await Promise.all(jobs);
}

export const emailSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-email',
    name: 'Fetch Email Details',
    entities: [entities.EMAIL],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchEmailDetails,
  },
];
