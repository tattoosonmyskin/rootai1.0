import { invokeLLM } from './llmClient';
import { createEntityStore } from './entityStore';

/**
 * Local drop-in replacement for the base44 SDK client.
 * - integrations.Core.InvokeLLM  → direct LLM API calls
 * - entities.*                    → localStorage-backed entity stores
 * - auth.*                        → no-op (local app, no auth required)
 */
export const base44 = {
  integrations: {
    Core: {
      InvokeLLM: invokeLLM
    }
  },
  entities: {
    QuerySession: createEntityStore('query_sessions'),
    KnowledgeNode: createEntityStore('knowledge_nodes'),
    DocumentEntry: createEntityStore('document_entries')
  },
  auth: {
    me: async () => ({ id: 'local', email: 'local@localhost', role: 'admin' }),
    logout: () => {},
    redirectToLogin: () => {}
  }
};
