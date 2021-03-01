import {
  RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const USER_ENTITY_DATA_KEY = 'entity:user';

type EntityConstantKeys = 'FINDING' | 'BREACH' | 'EMAIL';

export const entities: Record<EntityConstantKeys, StepEntityMetadata> = {
  BREACH: {
    resourceName: 'Record',
    _type: 'hibp_breach',
    _class: 'Record',
  },
  FINDING: {
    resourceName: 'Finding',
    _type: 'hibp_finding',
    _class: 'Finding',
  },
  EMAIL: {
    resourceName: 'Record',
    _type: 'email_address',
    _class: 'Record',
  },
};

type RelationshipConstantKeys = 'EMAIL_HAS_FINDING' | 'BREACH_HAS_FINDING';

export const relationships: Record<
  RelationshipConstantKeys,
  StepRelationshipMetadata
> = {
  EMAIL_HAS_FINDING: {
    _type: 'email_address_has_hibp_finding',
    _class: RelationshipClass.HAS,
    sourceType: entities.EMAIL._type,
    targetType: entities.FINDING._type,
  },
  BREACH_HAS_FINDING: {
    _type: 'hibp_breach_has_finding',
    _class: RelationshipClass.HAS,
    sourceType: entities.BREACH._type,
    targetType: entities.FINDING._type,
  },
};
