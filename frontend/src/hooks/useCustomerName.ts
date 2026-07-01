import { useState } from 'react';

const STORAGE_KEY = 'centralmax_customer_name';

export function useCustomerName() {
  const [name, setName] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  function saveName(newName: string) {
    localStorage.setItem(STORAGE_KEY, newName);
    setName(newName);
  }

  function clearName() {
    localStorage.removeItem(STORAGE_KEY);
    setName(null);
  }

  return { name, saveName, clearName };
}
