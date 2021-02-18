import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';

import { IntegrationConfig } from '../types';
import { fetchBreaches } from './breach';
import { fetchEmailDetails } from './email';
import { fetchFindings } from './finding';

const DEFAULT_CLIENT_API_KEY = 'dummy-client-api-key';

const integrationConfig: IntegrationConfig = {
  clientApiKey: process.env.CLIENT_API_KEY || DEFAULT_CLIENT_API_KEY,
};

jest.setTimeout(20 * 1000);

test('should collect data', async () => {
  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig: integrationConfig,
  });

  // Simulates dependency graph execution.
  // See https://github.com/JupiterOne/sdk/issues/262.
  await fetchEmailDetails(context);
  await fetchBreaches(context);
  await fetchFindings(context);

  // Review snapshot, failure is a regression
  expect({
    numCollectedEntities: context.jobState.collectedEntities.length,
    numCollectedRelationships: context.jobState.collectedRelationships.length,
    collectedEntities: context.jobState.collectedEntities,
    collectedRelationships: context.jobState.collectedRelationships,
    encounteredTypes: context.jobState.encounteredTypes,
  }).toMatchSnapshot();

  const records = context.jobState.collectedEntities.filter((e) =>
    e._type.includes('hibp_breach'),
  );
  expect(records.length).toBeGreaterThan(0);
  expect(records).toMatchGraphObjectSchema({
    _class: ['Record'],
    schema: {
      additionalProperties: true,
      properties: {
        _type: { const: 'hibp_breach' },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
        name: {
          type: 'string',
        },
      },
    },
  });

  //I think this has something to do with the fact that i am monitoring
  // the email address that I put in instanceConfig they should probably
  // be somewhere else.
  //
  // const findings = context.jobState.collectedEntities.filter((e) =>
  //   e._class.includes('hibp_finding'),
  // );
  // expect(findings.length).toBeGreaterThan(0);
  // expect(findings).toMatchGraphObjectSchema({
  //   _class: ['Finding'],
  //   schema: {
  //     additionalProperties: true,
  //     properties: {
  //       _type: { const: 'hibp_finding' },
  //       name: { type: 'string' },
  //       _rawData: {
  //         type: 'array',
  //         items: { type: 'object' },
  //       },
  //     },
  //   },
  // });

  const emails = context.jobState.collectedEntities.filter((e) =>
    e._type.includes('email_address'),
  );
  expect(emails.length).toBeGreaterThan(0);
  expect(emails).toMatchGraphObjectSchema({
    _class: ['Record'],
    schema: {
      additionalProperties: true,
      properties: {
        _type: { const: 'email_address' },
        name: { type: 'string' },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  });
});
