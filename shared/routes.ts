import { z } from 'zod';
import { insertConversationSchema, insertMessageSchema, insertSettingsSchema, conversations, messages, settings } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  conversations: {
    list: {
      method: 'GET' as const,
      path: '/api/conversations',
      responses: {
        200: z.array(z.custom<typeof conversations.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/conversations',
      input: z.object({ title: z.string().optional() }),
      responses: {
        201: z.custom<typeof conversations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/conversations/:id',
      responses: {
        200: z.custom<typeof conversations.$inferSelect & { messages: typeof messages.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/conversations/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  messages: {
    create: {
      method: 'POST' as const,
      path: '/api/conversations/:id/messages',
      input: z.object({ content: z.string() }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/settings',
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
