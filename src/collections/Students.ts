import type { CollectionConfig } from 'payload'

export const Students: CollectionConfig = {
  slug: 'students',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'level'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'level',
      type: 'select',
      options: ['guest', 'l1', 'l2', 'l3', 'coach'],
      defaultValue: 'guest',
      required: true,
    },
    {
      name: 'betterAuthId',
      type: 'text',
      unique: true,
      index: true,
    },
  ],
}
