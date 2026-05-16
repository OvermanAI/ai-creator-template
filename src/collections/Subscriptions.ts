import type { CollectionConfig } from 'payload'

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'studentEmail',
    defaultColumns: ['studentEmail', 'provider', 'status', 'level', 'currentPeriodEnd'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'studentEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'provider',
      type: 'text',
      defaultValue: 'none',
    },
    {
      name: 'status',
      type: 'select',
      options: ['active', 'cancelled', 'past_due', 'trialing'],
      defaultValue: 'active',
    },
    {
      name: 'level',
      type: 'select',
      options: ['l1', 'l2', 'l3'],
    },
    {
      name: 'currentPeriodEnd',
      type: 'date',
    },
  ],
}
