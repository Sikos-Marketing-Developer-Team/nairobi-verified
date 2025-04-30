"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { FaShoppingBag, FaHeart, FaUser, FaStore, FaSearch } from "react-icons/fa";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  interface Order {
    id: string;
    date: string;
    status: string;
    total: number;
  }

  interface Vendor {
    id: number;
    name: string;
    category: string;
  }

  const [userData, setUserData] = useState<{
    fullName: string;
    email: string;
    recentOrders: Order[];
    savedVendors: Vendor[];
  }>({
    fullName: "",
    email: "",
    recentOrders: [],
    savedVendors: [],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if localStorage is available
        if (!window.localStorage) {
          setMessage("Local storage is disabled. Please enable it to continue.");
          setIsLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/signin");
          return;
        }

        // Simulate API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setUserData({
          fullName: "John Doe",
          email: "john.doe@example.com",
          recentOrders: [
            { id: "ORD-001", date: "2023-06-15", status: "Delivered", total: 3500 },
            { id: "ORD-002", date: "2023-06-10", status: "Processing", total: 1200 },
            { id: "ORD-003", date: "2023-06-05", status: "Delivered", total: 2800 },
          ],
          savedVendors: [
            { id: 1, name: "Electronics Hub", category: "Electronics" },
            { id: 2, name: "Fashion World", category: "Fashion" },
            { id: 3, name: "Fresh Groceries", category: "Grocery" },
          ],
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage("Failed to load user data. Please try again.");
        setIsLoading(false);
      }
    };

    // Handle verification message
    const verified = searchParams.get("verified");
    if (verified === "true" && searchParams.toString()) {
      setMessage("Email verified successfully!");
      router.replace("/dashboard", { scroll: false });
    } else {
      fetchUserData();
    }
  }, [router, searchParams]);

  return (
    <MainLayout>
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {message && (
            <div className="mb-6 rounded-lg bg-green-100 p-4 border-l-4 border-green-500 text-green-700">
              <p>{message}</p>
            </div>
          )}

          <div className="mb-8 flex flex-col justify-between md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
              <p className="text-gray-600">Welcome back, {userData.fullName || "Guest"}</p>
            </div>
            <div className="relative mt-4 md:mt-0">
              <div className="flex items-center overflow-hidden rounded-lg bg-white shadow-sm">
                <input
                  type="text"
                  placeholder="Search for vendors or products..."
                  className="w-64 py-2 px-4 focus:outline-none"
                />
                <button
                  type="button"
                  className="p-2 bg-orange-600 text-white"
                  aria-label="Search"
                >
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div
              className="flex h-64 items-center justify-center"
              role="status"
              aria-label="Loading"
            >
              <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {/* Quick Links */}
              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <a
                  href="/marketplace"
                  className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 rounded-full bg-orange-100 p-3 text-orange-500">
                    <FaStore className="text-xl" />
                  </div>
                  <h3 className="font-medium text-gray-800">Marketplace</h3>
                  <p className="mt-1 text-sm text-gray-500">Explore verified vendors</p>
                </a>

                <a
                  href="/orders"
                  className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-500">
                    <FaShoppingBag className="text-xl" />
                  </div>
                  <h3 className="font-medium text-gray-800">My Orders</h3>
                  <p className="mt-1 text-sm text-gray-500">Track your purchases</p>
                </a>

                <a
                  href="/favorites"
                  className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 rounded-full bg-red-100 p-3 text-red-500">
                    <FaHeart className="text-xl" />
                  </div>
                  <h3 className="font-medium text-gray-800">Favorites</h3>
                  <p className="mt-1 text-sm text-gray-500">Your saved vendors</p>
                </a>

                <a
                  href="/profile"
                  className="flex flex-col items-center rounded-lg bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 rounded-full bg-green-100 p-3 text-green-500">
                    <FaUser className="text-xl" />
                  </div>
                  <h3 className="font-medium text-gray-800">My Profile</h3>
                  <p className="mt-1 text-sm text-gray-500">Manage your account</p>
                </a>
              </div>

              {/* Recent Orders */}
              <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                  <a
                    href="/orders"
                    className="text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    View All
                  </a>
                </div>
                {userData.recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Order ID
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {userData.recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                              {order.id}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {order.date}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  order.status === "Delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "Processing"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              KES {order.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="py-4 text-center text-gray-500">
                    You haven&apos;t placed any orders yet.
                  </p>
                )}
              </div>

              {/* Saved Vendors */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Saved Vendors</h2>
                  <a
                    href="/favorites"
                    className="text-sm font-medium text-orange-600 hover:text-orange-700"
                  >
                    View All
                  </a>
                </div>
                {userData.savedVendors.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {userData.savedVendors.map((vendor) => (
                      <a
                        key={vendor.id}
                        href={`/vendor/${vendor.id}`}
                        className="block rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                      >
                        <h3 className="font-medium text-gray-800">{vendor.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{vendor.category}</p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-gray-500">
                    You haven&apos;t saved any vendors yet.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}