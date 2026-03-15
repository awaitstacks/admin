/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { Loader2, Building2, QrCode, IndianRupee } from "lucide-react";

const PaymentDetailsAdmin = () => {
  const { getPaymentMethods } = useContext(TourAdminContext);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getPaymentMethods();
        if (res?.success) {
          setPaymentMethods(res.paymentMethods || []);
        } else {
          setError(res?.message || "Failed to load payment methods");
        }
      } catch (err) {
        setError("Something went wrong. Please try again later.");
        console.error("Admin payment fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getPaymentMethods]);

  const bankMethods = paymentMethods.filter((m) => m.type === "bank");
  const upiMethods = paymentMethods.filter((m) => m.type === "upi");

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Payment Methods
          </h1>
          <p className="mt-3 text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
            View all available bank accounts and UPI/QR options for travellers
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && paymentMethods.length === 0 && (
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg font-medium">
              No payment methods have been added yet.
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && paymentMethods.length > 0 && (
          <div className="space-y-16">
            {/* Bank Methods */}
            {bankMethods.length > 0 && (
              <section>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8 flex items-center justify-center gap-3">
                  <Building2 className="text-indigo-600" size={32} />
                  Bank Transfer Options
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {bankMethods.map((method) => (
                    <div
                      key={method._id}
                      className="bg-white rounded-2xl shadow border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-start gap-4 mb-5">
                        <IndianRupee
                          className="text-indigo-600 mt-1"
                          size={32}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-xl text-gray-900">
                            {method.bankName || "Bank Account"}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {method.branchName || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-base text-gray-700">
                        <p>
                          <span className="font-medium text-gray-800">
                            A/C No:
                          </span>{" "}
                          {method.accountNumber}
                        </p>
                        <p>
                          <span className="font-medium text-gray-800">
                            IFSC:
                          </span>{" "}
                          {method.ifsc}
                        </p>
                        {method.swift && (
                          <p>
                            <span className="font-medium text-gray-800">
                              Swift:
                            </span>{" "}
                            {method.swift}
                          </p>
                        )}
                        <p>
                          <span className="font-medium text-gray-800">
                            Beneficiary:
                          </span>{" "}
                          {method.beneficiary}
                        </p>
                        <p className="text-gray-600 italic">
                          {method.accountType || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* UPI Methods */}
            {upiMethods.length > 0 && (
              <section>
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-8 flex items-center justify-center gap-3">
                  <QrCode className="text-teal-600" size={32} />
                  UPI / QR Code Options
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {upiMethods.map((method) => (
                    <div
                      key={method._id}
                      className="bg-white rounded-2xl shadow border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      <div className="flex items-start gap-4 mb-5">
                        <QrCode className="text-teal-600 mt-1" size={32} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-xl text-gray-900">
                            UPI Payment
                          </h3>
                          <p className="text-gray-600 text-base break-all mt-1">
                            {method.upiId}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-base text-gray-700 mb-6">
                        <p>
                          <span className="font-medium text-gray-800">
                            Phone (GPay/PhonePe):
                          </span>{" "}
                          {method.phone}
                        </p>
                      </div>

                      {method.qrImage && (
                        <div className="mt-auto flex justify-center">
                          <img
                            src={method.qrImage}
                            alt="UPI QR Code - Scan to Pay"
                            className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDetailsAdmin;
