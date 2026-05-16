import type { CollectionConfig } from 'payload'

export const Purchases: CollectionConfig = {
  slug: 'purchases',
  admin: {
    useAsTitle: 'studentEmail',
    defaultColumns: ['studentEmail', 'lessonId', 'provider', 'amount', 'paidAt'],
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
      name: 'lessonId',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
    },
    {
      name: 'provider',
      type: 'text',
      defaultValue: 'none',
    },
    {
      name: 'amount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'paidAt',
      type: 'date',
    },
  ],
}
