// Supabase adapter: accounts (email + password) and the public `restaurants` table.
// Returns null when no Supabase keys are set, so the game falls back to playing in this browser only.
import { createClient } from "@supabase/supabase-js";

export function createBackend(){
  // the project's public URL and publishable key (safe to ship in the page); env vars override them
  const url = import.meta.env.VITE_SUPABASE_URL || "https://rpkvgnxprtutljitypmz.supabase.co";
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_JWAmTv_uTMIKOfypUr99Pw_xuytK1sn";
  if (!url || !key) return null;
  const sb = createClient(url, key);
  const toDoc = r => r && {id:r.id, name:r.name, owner:r.owner, level:r.level, served:r.served, stars:r.stars, S:r.state};
  const check = ({data, error}) => { if (error) throw error; return data; };
  return {
    async currentUser(){ return check(await sb.auth.getSession()).session?.user ?? null; },
    onAuth(fn){ sb.auth.onAuthStateChange((_event, session) => fn(session?.user ?? null)); },
    async signUp(email, password){
      const d = check(await sb.auth.signUp({email, password, options:{emailRedirectTo: location.origin}}));
      return {user:d.user, signedIn:!!d.session};
    },
    async signIn(email, password){ check(await sb.auth.signInWithPassword({email, password})); },
    async signOut(){ await sb.auth.signOut(); },
    async getRestaurant(id){ return toDoc(check(await sb.from("restaurants").select("*").eq("id", id).maybeSingle())); },
    async saveRestaurant(id, doc){
      check(await sb.from("restaurants").upsert({id, name:doc.name, owner:doc.owner, level:doc.level, served:doc.served, stars:doc.stars, state:doc.S, updated_at:new Date().toISOString()}));
    },
    async listRestaurants(limit){
      return check(await sb.from("restaurants").select("id,name,owner,level,stars,updated_at").order("updated_at", {ascending:false}).limit(limit));
    },
  };
}
