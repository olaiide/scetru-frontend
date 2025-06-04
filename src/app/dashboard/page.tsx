"use client";
import { useState, useEffect, useMemo, FC, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import Header from "@/components/Header";
import SummaryCard from "@/components/SummaryCard";
import ChevronIcon from "@/components/Icon";
let socket: Socket;

type transactionData = {
  amount: number;
  currency: string;
  date: Date;
  status: string;
  user: string;
};

interface ColumnFilter {
  id: string;
  value: unknown;
}
type ColumnFiltersState = ColumnFilter[];

const Dashboard = () => {
  const router = useRouter();
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [transactions, setTransactions] = useState<transactionData[]>([]);

  useEffect(() => {
    setLoadingTransactions(true);
    socket = io(process.env.NEXT_PUBLIC_API_BASE_URL);

    const timeout = setTimeout(() => {
      setLoadingTransactions(false);
    }, 5000);

    socket.on("connect", () => {});

    socket.on("transactions", (data: transactionData[]) => {
      clearTimeout(timeout);
      setTransactions(data);
      setLoadingTransactions(false);
    });

    socket.on("new-transactions", (newOnes: transactionData[]) => {
      setLoadingTransactions(true);
      setTimeout(() => {
        setTransactions((prev) => [...newOnes, ...prev]);
        setLoadingTransactions(false);
      }, 100);
    });

    return () => {
      if (socket) socket.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        router.push("/login");
      } else {
        console.error("Logout failed.");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const columnHelper = createColumnHelper<transactionData>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("user", {
        header: () => "User",
        cell: (info) => info.getValue(),
        filterFn: "includesString",
      }),
      columnHelper.accessor("amount", {
        header: () => "Amount",
        cell: (info) => `${info.getValue()}`,
      }),
      columnHelper.accessor("currency", {
        header: () => "Currency",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("date", {
        header: () => "Date",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor("status", {
        header: () => "Status",
        cell: (info) => {
          const status = info.getValue();
          let statusClass = "";
          switch (status) {
            case "completed":
              statusClass = "bg-green-100 text-green-800";
              break;
            case "pending":
              statusClass = "bg-yellow-100 text-yellow-800";
              break;
            case "failed":
              statusClass = "bg-red-100 text-red-800";
              break;
            default:
              statusClass = "bg-gray-100 text-gray-800";
          }
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
            >
              {status}
            </span>
          );
        },
        filterFn: "includesString",
      }),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
  });

  if (loadingTransactions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header handleLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 mb-8">
          <SummaryCard
            title="Total Balance"
            value={`${new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
              .format(
                transactions.reduce(
                  (acc, transaction) => acc + transaction.amount,
                  0
                )
              )
              .replace("NGN", "")
              .trim()}`}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18V6m0 0l12 12M18 6v12M3 10h18M3 14h18"
                />
              </svg>
            }
          />

          <SummaryCard
            title="Users"
            value={transactions?.length}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          />
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Transactions
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              All transactions from the last 30 days
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-8 mt-8 px-5">
            <div className="flex flex-col">
              <label
                htmlFor="user-filter"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Filter by User
              </label>
              <input
                id="user-filter"
                type="text"
                placeholder="e.g. John"
                value={
                  (columnFilters.find((f) => f.id === "user")
                    ?.value as string) || ""
                }
                onChange={(e) =>
                  setColumnFilters((old) =>
                    old
                      .filter((f) => f.id !== "user")
                      .concat({ id: "user", value: e.target.value })
                  )
                }
                className="w-64 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-100"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="status-filter"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={
                  (columnFilters.find((f) => f.id === "status")
                    ?.value as string) || ""
                }
                onChange={(e) =>
                  setColumnFilters((old) =>
                    old
                      .filter((f) => f.id !== "status")
                      .concat(
                        e.target.value
                          ? { id: "status", value: e.target.value }
                          : []
                      )
                  )
                }
                className="w-64 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-100"
              >
                <option value="">All</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: (
                              <ChevronIcon
                                direction="up"
                                className="ml-1 h-4 w-4"
                              />
                            ),
                            desc: (
                              <ChevronIcon
                                direction="down"
                                className="ml-1 h-4 w-4"
                              />
                            ),
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
