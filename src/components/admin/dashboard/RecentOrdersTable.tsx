import React from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MOCK_ORDERS } from "@/mocks/orders";

interface RecentOrdersTableProps {
  orders?: any[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps = {}) {
  const recentOrders = orders && orders.length > 0 ? orders : MOCK_ORDERS.slice(0, 6);

  return (
    <section className="bg-white border border-[#E4E0DB] rounded-[10px] overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-[#E4E0DB] flex items-center justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-[#111111]">
            Recent Orders
          </h2>
          <p className="text-xs text-[#6B6667] mt-0.5">
            Latest customer marketplace transactions
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] inline-flex items-center gap-1 transition-colors"
        >
          <span>View all orders</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="h-10 bg-[#F7F7F5] border-b border-[#E4E0DB] text-xs font-medium text-[#6B6667]">
              <th className="px-4 sm:px-5 py-0 font-medium">Order ID</th>
              <th className="px-4 py-0 font-medium">Customer</th>
              <th className="px-4 py-0 font-medium">Boutique Vendor</th>
              <th className="px-4 py-0 font-medium">Fulfillment</th>
              <th className="px-4 py-0 font-medium text-right">Amount</th>
              <th className="px-4 py-0 font-medium text-center">Status</th>
              <th className="px-4 sm:px-5 py-0 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E0DB] text-[13px] text-[#111111]">
            {recentOrders.map((order) => (
              <tr key={order.id} className="h-11 sm:h-12 hover:bg-[#F7F7F5]/50 transition-colors">
                <td className="px-4 sm:px-5 py-0 font-mono text-xs font-medium text-[#111111] whitespace-nowrap">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-0 text-[#111111] font-medium whitespace-nowrap">
                  {order.customerName}
                </td>
                <td className="px-4 py-0 text-[#6B6667] truncate max-w-[170px]">
                  {order.vendorName || order.boutiqueName || "Boutique Partner"}
                </td>
                <td className="px-4 py-0 text-xs text-[#6B6667] whitespace-nowrap">
                  {order.fulfillmentType || (order.isTryAndBuy ? "Try & Buy" : "Standard Delivery")}
                </td>
                <td className="px-4 py-0 font-semibold text-[#111111] text-right tabular-nums whitespace-nowrap">
                  ₹{(order.grandTotal ?? order.amount ?? order.totalAmount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-0 text-center whitespace-nowrap">
                  <StatusBadge status={order.status} variant="order" />
                </td>
                <td className="px-4 sm:px-5 py-0 text-right whitespace-nowrap">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-xs font-medium text-[#FF5A1F] hover:text-[#D94B17] inline-flex items-center gap-0.5 hover:bg-[#FFF0E8] px-2 py-0.5 rounded transition-colors"
                  >
                    <span>View</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
