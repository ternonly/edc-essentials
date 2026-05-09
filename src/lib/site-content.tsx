import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type ContentMap = Record<string, Record<string, any>>; // group -> key -> value

const Ctx = createContext<{ content: ContentMap; loaded: boolean; refresh: () => void }>({
  content: {},
  loaded: false,
  refresh: () => {},
});

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentMap>({});
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const { data } = await supabase.from("site_content").select("group_key,item_key,value");
    const map: ContentMap = {};
    (data ?? []).forEach((row: any) => {
      map[row.group_key] = map[row.group_key] ?? {};
      map[row.group_key][row.item_key] = row.value;
    });
    setContent(map);
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  return <Ctx.Provider value={{ content, loaded, refresh: load }}>{children}</Ctx.Provider>;
}

/** Read a content block, falling back to defaults if missing. Shallow merges objects. */
export function useContentBlock<T extends Record<string, any>>(group: string, key: string, defaults: T): T {
  const { content } = useContext(Ctx);
  const stored = content[group]?.[key];
  if (!stored) return defaults;
  if (typeof stored === "object" && !Array.isArray(stored)) {
    return { ...defaults, ...stored } as T;
  }
  return stored as T;
}

export function useSiteContent() {
  return useContext(Ctx);
}
