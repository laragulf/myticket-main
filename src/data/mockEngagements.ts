import type { MockEngagement } from '@/types/domain';

export const MOCK_ENGAGEMENTS_SEED: MockEngagement[] = [
  {
    id: 'eng-1',
    organizerName: 'Pulse Events KSA',
    organizerId: 'org-1',
    topic: 'Festival slot — June weekend',
    preview: 'We would like to discuss performance timing and backline for the main stage…',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'eng-2',
    organizerName: 'Coastal Live',
    organizerId: 'org-2',
    topic: 'Comedy tour support',
    preview: 'Opening act inquiry for the west coast run.',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
