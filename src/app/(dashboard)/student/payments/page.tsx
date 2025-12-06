import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/utils";

async function getPayments(userId: string) {
  return await prisma.payment.findMany({
    where: {
      booking: {
        studentId: userId,
      },
    },
    include: {
      booking: {
        include: {
          tutor: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function StudentPaymentsPage() {
  const session = await auth();
  const payments = await getPayments(session!.user.id);

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600 mt-2">View all your lesson payments</p>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6">
        <p className="text-purple-100 mb-2">Total Spent</p>
        <p className="text-4xl font-bold">{formatCurrency(total)}</p>
        <p className="text-purple-100 mt-2">
          {payments.length} lesson{payments.length !== 1 ? "s" : ""} paid
        </p>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tutor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500">
                    No payments yet
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDateTime(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex-shrink-0 overflow-hidden">
                          {payment.booking.tutor.image ? (
                            <img
                              src={payment.booking.tutor.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-purple-600 font-semibold text-xs">
                              {payment.booking.tutor.name[0]}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {payment.booking.tutor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.method}
                      {payment.method === "MOCK" && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Demo)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> All payments shown are demo/mock payments. When
          going live, this will integrate with Stripe for real payment
          processing.
        </p>
      </div>
    </div>
  );
}
