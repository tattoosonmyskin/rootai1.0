/**
 * Local Entity Store
 * Persists data in localStorage, providing a simple CRUD interface
 * that mirrors the base44 entity API.
 */

const STORAGE_PREFIX = 'rootai_';

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getCollection(name) {
  try {
    const key = `${STORAGE_PREFIX}${name}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCollection(name, items) {
  try {
    const key = `${STORAGE_PREFIX}${name}`;
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    console.warn(`Failed to persist ${name} to localStorage`);
  }
}

/**
 * Create an entity store for a named collection.
 * @param {string} collectionName
 */
export function createEntityStore(collectionName) {
  return {
    async create(data) {
      const item = {
        ...data,
        id: generateId(),
        created_date: new Date().toISOString()
      };
      const items = getCollection(collectionName);
      items.push(item);
      saveCollection(collectionName, items);
      return item;
    },

    async update(id, data) {
      const items = getCollection(collectionName);
      const idx = items.findIndex(i => i.id === id);
      if (idx >= 0) {
        items[idx] = { ...items[idx], ...data };
        saveCollection(collectionName, items);
        return items[idx];
      }
      return null;
    },

    async list(sortField = '-created_date', limit = 30) {
      const items = getCollection(collectionName);
      const descending = sortField.startsWith('-');
      const field = descending ? sortField.slice(1) : sortField;

      const sorted = [...items].sort((a, b) => {
        const av = String(a[field] || '');
        const bv = String(b[field] || '');
        return descending ? bv.localeCompare(av) : av.localeCompare(bv);
      });

      return sorted.slice(0, limit);
    },

    async bulkCreate(dataArray) {
      const items = getCollection(collectionName);
      const created = dataArray.map(d => ({
        ...d,
        id: generateId(),
        created_date: new Date().toISOString()
      }));
      items.push(...created);
      saveCollection(collectionName, items);
      return created;
    },

    async get(id) {
      const items = getCollection(collectionName);
      return items.find(i => i.id === id) || null;
    },

    async delete(id) {
      const items = getCollection(collectionName);
      const filtered = items.filter(i => i.id !== id);
      saveCollection(collectionName, filtered);
      return true;
    }
  };
}
