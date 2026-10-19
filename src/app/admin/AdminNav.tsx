import { AdminChrome } from "@/app/admin/AdminChrome";
import { readMessages } from "@/lib/messages";
import { readOrders } from "@/lib/orders";

export async function AdminNav() {
  const [orders, messages] = await Promise.all([readOrders(), readMessages()]);
  const newOrders = orders.filter((order) => order.status === "nova").length;
  const unread = messages.filter((message) => !message.read).length;
  return <AdminChrome newOrders={newOrders} unread={unread} />;
}
