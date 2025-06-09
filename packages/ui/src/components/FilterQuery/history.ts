import { last } from "lodash";

function asKey(id: string) {
  return `litespace::filter-query::${id}`;
}

function load(id: string): string[] {
  const key = asKey(id);
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function save(id: string, search: string) {
  const key = asKey(id);
  const list = load(id);
  const prev = last(list);
  if (prev === search) return;
  localStorage.setItem(key, JSON.stringify([...list, search]));
}

function get(id: string, index: number): string | null {
  const list = load(id);
  return list[index] || null;
}

/**
 * @param id query id
 * @returns the next available index
 */
function tick(id: string): number {
  return load(id).length;
}

export default {
  save,
  get,
  tick,
};
