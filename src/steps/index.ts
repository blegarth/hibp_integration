import { emailSteps } from './email';
import { breachSteps } from './breach';
import { findingSteps } from './finding';

const integrationSteps = [...emailSteps, ...breachSteps, ...findingSteps];

export { integrationSteps };
