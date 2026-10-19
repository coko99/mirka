import { mutateJsonFile, readJsonFile } from "@/lib/json-store";
import {
  getSupabase,
  isMissingRelation,
  isSupabaseConfigured,
  throwIfError,
} from "@/lib/supabase";

export type SiteMessage = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
};

const FILE = "messages.json";

type MessageRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
};

function fromRow(row: MessageRow): SiteMessage {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    read: row.read,
  };
}

export async function readMessages() {
  if (!isSupabaseConfigured()) {
    const messages = await readJsonFile<SiteMessage[]>(FILE, []);
    return [...messages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  const { data, error } = await getSupabase()
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (isMissingRelation(error)) {
    const messages = await readJsonFile<SiteMessage[]>(FILE, []);
    return [...messages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  throwIfError(error, "Poruke nisu učitane.");
  return ((data ?? []) as MessageRow[]).map(fromRow);
}

export async function createMessage(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  if (name.length < 2 || !email.includes("@") || message.length < 3) {
    throw new Error("Popunite ime, email i poruku.");
  }

  const entry: SiteMessage = {
    id: `MSG-${Date.now()}`,
    createdAt: new Date().toISOString(),
    name,
    email,
    phone: input.phone.trim(),
    message,
    read: false,
  };

  if (!isSupabaseConfigured()) {
    await mutateJsonFile<SiteMessage[]>(FILE, [], (messages) => [entry, ...messages]);
    return entry;
  }

  const { error } = await getSupabase().from("messages").insert({
    id: entry.id,
    created_at: entry.createdAt,
    name: entry.name,
    email: entry.email,
    phone: entry.phone,
    message: entry.message,
    read: entry.read,
  });
  throwIfError(error, "Poruka nije sačuvana.");
  return entry;
}

export async function markMessageRead(id: string) {
  if (!isSupabaseConfigured()) {
    await mutateJsonFile<SiteMessage[]>(FILE, [], (messages) =>
      messages.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
    return;
  }
  const { error } = await getSupabase()
    .from("messages")
    .update({ read: true })
    .eq("id", id);
  throwIfError(error, "Poruka nije označena.");
}

export async function deleteMessage(id: string) {
  if (!isSupabaseConfigured()) {
    await mutateJsonFile<SiteMessage[]>(FILE, [], (messages) =>
      messages.filter((item) => item.id !== id),
    );
    return;
  }
  const { error } = await getSupabase().from("messages").delete().eq("id", id);
  throwIfError(error, "Poruka nije obrisana.");
}
