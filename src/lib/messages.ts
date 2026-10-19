import { mutateJsonFile, readJsonFile } from "@/lib/json-store";

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

export async function readMessages() {
  const messages = await readJsonFile<SiteMessage[]>(FILE, []);
  return [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
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

  await mutateJsonFile<SiteMessage[]>(FILE, [], (messages) => [entry, ...messages]);
  return entry;
}

export async function markMessageRead(id: string) {
  await mutateJsonFile<SiteMessage[]>(FILE, [], (messages) =>
    messages.map((item) => (item.id === id ? { ...item, read: true } : item)),
  );
}

export async function deleteMessage(id: string) {
  await mutateJsonFile<SiteMessage[]>(FILE, [], (messages) =>
    messages.filter((item) => item.id !== id),
  );
}
