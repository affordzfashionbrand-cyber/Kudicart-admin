import React from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MOCK_ORDERS } from "@/mocks/orders";

export function RecentOrdersTable() {
  const recentOrders = MOCK_ORDERS.slice(0, 6);

  return (
    <div className="bg-white border border-[#E4E0DB] rounded-xl overflow-hidden shadow-sm">
      <div className="px-space-md py-3.5 border-b border-[#E4E0DB] flex items-center justify-between">
        <div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Recent Marketplace Orders
          </h3>
          <p className="font-body-sm text-body-sm text-secondary">
            Live orders arriving from customer mobile app and web checkout.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="font-label-sm text-label-sm text-primary hover:text-pressed-orange font-semibold flex items-center gap-1"
        >
          View all {MOCK_ORDERS.length} orders →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-secondary font-label-xs text-label-xs uppercase tracking-wider">
              <th className="px-4 py-0 font-semibold">Order ID</th>
              <th className="px-4 py-0 font-semibold">Customer</th>
              <th className="px-4 py-0 font-semibold">Boutique Vendor</th>
              <th className="px-4 py-0 font-semibold">Fulfillment Type</th>
              <th className="px-4 py-0 font-semibold text-right">Amount</th>
              <th className="px-4 py-0 font-semibold text-center">Status</th>
              <th className="px-4 py-0 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E0DB] text-body-sm font-body-sm text-on-surface">
            {recentOrders.map((order) => (
              <tr key={order.id} className="h-12 hover:bg-[#F7F7F5] transition-colors">
                <td className="px-4 py-0 font-code-sm text-code-sm font-semibold text-on-surface">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-0 font-body-sm-medium text-body-sm-medium text-on-surface">
                  {order.customerName}
                </td>
                <td className="px-4 py-0 text-secondary">{order.vendorName}</td>
                <td className="px-4 py-0">
                  <StatusBadge
                    status={order.fulfillmentType}
                    variant="fulfillment"
                  />
                </td>
                <td className="px-4 py-0 font-code-sm text-code-sm text-on-surface font-semibold text-right tabular-nums">
                  ₹{order.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-0 text-center">
                  <StatusBadge status={order.status} variant="order" />
                </td>
                <td className="px-4 py-0 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="h-7 px-2.5 text-primary hover:text-pressed-orange font-label-xs text-label-xs font-semibold inline-flex items-center gap-0.5 hover:bg-[#FFF0E8]/50 rounded transition-colors"
                  >
                    <span>View</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
