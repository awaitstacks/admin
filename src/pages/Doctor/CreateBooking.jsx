// // // import React, { useContext, useEffect, useState } from "react";
// // // import { useNavigate, useLocation } from "react-router-dom";
// // // import { TourContext } from "../../context/TourContext";
// // // import { toast } from "react-toastify";

// // // // stationCode is NOT guaranteed unique within a tour's boardingPoints /
// // // // deboardingPoints array (same mirrors the customer-facing TourBooking.jsx
// // // // fix) — select/match by each point's own _id instead.
// // // const getPointId = (point) => {
// // //   if (!point) return "";
// // //   const raw = point._id;
// // //   if (raw && typeof raw === "object" && raw.$oid) return String(raw.$oid);
// // //   return raw !== undefined && raw !== null ? String(raw) : "";
// // // };

// // // // Blank traveller — same shape as the customer-facing booking form, plus
// // // // two admin-only fields: isCoTraveller/aadhaar (hidden, not rendered,
// // // // forwarded as-is to the backend) that track whether this traveller came
// // // // through Aadhaar OCR on the Aadhaar Upload page.
// // // const blankTraveller = () => ({
// // //   title: "Mr",
// // //   firstName: "",
// // //   lastName: "",
// // //   age: "",
// // //   gender: "Male",
// // //   sharingType: "",
// // //   selectedAddon: null,
// // //   selectedAddons: [],
// // //   boardingPoint: null,
// // //   deboardingPoint: null,
// // //   remarks: "",
// // //   packageType: "main",
// // //   variantPackageIndex: null,
// // //   isCoTraveller: false,
// // //   _aadhaar: null, // { front, back } once OCR'd — never rendered, just carried through
// // // });

// // // // Merge an OCR-prefilled traveller (from AadhaarUpload: title/firstName/
// // // // lastName/age/gender/isCoTraveller/_aadhaar only) onto the full blank
// // // // shape so every booking-specific field the admin still has to fill
// // // // (package, sharing, boarding/deboarding, addons, remarks) is present.
// // // const hydrateTraveller = (partial) => ({
// // //   ...blankTraveller(),
// // //   ...partial,
// // // });

// // // const CreateBooking = () => {
// // //   const location = useLocation();
// // //   const navigate = useNavigate();

// // //   const {
// // //     tourList,
// // //     getTourList,
// // //     currencySymbol,
// // //     adminAddBooking,
// // //   } = useContext(TourContext);

// // //   // ── Format 1: direct nav (no state) → manual booking, admin picks the
// // //   // tour from the dropdown below.
// // //   // ── Format 2: nav'd from AadhaarUpload with { tourId, travellers,
// // //   // paymentScreenshots } in state → everything pre-filled.
// // //   const incoming = location.state || {};

// // //   const [tourId, setTourId] = useState(incoming.tourId || "");
// // //   const [tourInfo, setTourInfo] = useState(null);
// // //   const [bookingType] = useState("offline"); // admin walk-ins are always offline/in-person
// // //   const [isSubmitting, setIsSubmitting] = useState(false);

// // //   const [travellers, setTravellers] = useState(
// // //     incoming.travellers?.length > 0
// // //       ? incoming.travellers.map(hydrateTraveller)
// // //       : [blankTraveller()],
// // //   );

// // //   const [paymentScreenshots] = useState(incoming.paymentScreenshots || {});

// // //   const [amounts, setAmounts] = useState({
// // //     advance: 0,
// // //     balance: 0,
// // //     addonsTotal: 0,
// // //   });

// // //   const [contact, setContact] = useState({ email: "", mobile: "" });

// // //   const [billingAddress, setBillingAddress] = useState({
// // //     addressLine1: "",
// // //     addressLine2: "",
// // //     city: "",
// // //     state: "",
// // //     pincode: "",
// // //     country: "India",
// // //   });

// // //   useEffect(() => {
// // //     if (!tourList || tourList.length === 0) getTourList();
// // //   }, [tourList, getTourList]);

// // //   useEffect(() => {
// // //     if (!tourId || !tourList?.length) {
// // //       setTourInfo(null);
// // //       return;
// // //     }
// // //     const t = tourList.find((tour) => tour._id === tourId);
// // //     setTourInfo(t || null);
// // //   }, [tourId, tourList]);

// // //   useEffect(() => {
// // //     if (!tourInfo) return;

// // //     let totalAdvance = 0;
// // //     let totalBalance = 0;
// // //     let totalAddons = 0;

// // //     travellers.forEach((t) => {
// // //       const age = Number(t.age);
// // //       let travellerAdvance = 0;
// // //       let travellerBalance = 0;

// // //       const selectedPackage =
// // //         t.packageType === "main"
// // //           ? tourInfo
// // //           : tourInfo.variantPackage?.[t.variantPackageIndex];

// // //       if (!selectedPackage) return;

// // //       if (age >= 11) {
// // //         travellerAdvance = Number(selectedPackage.advanceAmount?.adult) || 0;
// // //         if (t.sharingType === "double") {
// // //           travellerBalance = Number(selectedPackage.balanceDouble) || 0;
// // //         } else if (t.sharingType === "triple") {
// // //           travellerBalance = Number(selectedPackage.balanceTriple) || 0;
// // //         }
// // //       } else if (age >= 6 && age <= 10) {
// // //         travellerAdvance = Number(selectedPackage.advanceAmount?.child) || 0;
// // //         if (t.sharingType === "withBerth") {
// // //           travellerBalance = Number(selectedPackage.balanceChildWithBerth) || 0;
// // //         } else if (t.sharingType === "withoutBerth") {
// // //           travellerBalance =
// // //             Number(selectedPackage.balanceChildWithoutBerth) || 0;
// // //         }
// // //       }

// // //       const travellerAddons = Array.isArray(t.selectedAddons)
// // //         ? t.selectedAddons
// // //         : [];
// // //       travellerAddons.forEach((addon) => {
// // //         const addonPrice = Number(addon.amount) || 0;
// // //         totalAddons += addonPrice;
// // //         travellerAdvance += addonPrice;
// // //       });

// // //       const flatAddonPrice = Number(t.selectedAddon?.price) || 0;
// // //       totalAddons += flatAddonPrice;
// // //       travellerAdvance += flatAddonPrice;

// // //       totalAdvance += travellerAdvance;
// // //       totalBalance += travellerBalance;
// // //     });

// // //     setAmounts({
// // //       advance: totalAdvance,
// // //       balance: totalBalance,
// // //       addonsTotal: totalAddons,
// // //     });
// // //   }, [travellers, tourInfo]);

// // //   const handleTravellerChange = (index, field, value) => {
// // //     const updated = [...travellers];

// // //     if (field === "title") {
// // //       if (value === "Mr") updated[index].gender = "Male";
// // //       else if (value === "Mrs" || value === "Ms") updated[index].gender = "Female";
// // //     }
// // //     if (field === "gender") {
// // //       if (value === "Male") updated[index].title = "Mr";
// // //       else if (value === "Female") updated[index].title = "Ms";
// // //     }
// // //     if (field === "age") {
// // //       const age = Number(value);
// // //       if (age > 85) {
// // //         toast.error("Age cannot exceed 85 years.");
// // //         return;
// // //       }
// // //       if (age >= 11) updated[index].sharingType = "double";
// // //       else if (age >= 6 && age <= 10) updated[index].sharingType = "withBerth";
// // //       else updated[index].sharingType = "";
// // //     }

// // //     updated[index][field] = value;

// // //     if (field === "packageType" || field === "variantPackageIndex") {
// // //       updated[index].boardingPoint = null;
// // //       updated[index].deboardingPoint = null;
// // //       updated[index].selectedAddon = null;
// // //       updated[index].selectedAddons = [];
// // //     }

// // //     setTravellers(updated);
// // //   };

// // //   const addTraveller = () => setTravellers([...travellers, blankTraveller()]);

// // //   const removeTraveller = (index) =>
// // //     setTravellers(travellers.filter((_, i) => i !== index));

// // //   const handleAddonChange = (travellerIndex, trainIndex, addonId) => {
// // //     const updated = [...travellers];
// // //     const traveller = updated[travellerIndex];
// // //     const selectedPackage =
// // //       traveller.packageType === "main"
// // //         ? tourInfo
// // //         : tourInfo.variantPackage?.[traveller.variantPackageIndex];
// // //     const train = selectedPackage?.trainDetails?.[trainIndex];
// // //     if (!train) return;

// // //     let selectedAddons = Array.isArray(traveller.selectedAddons)
// // //       ? [...traveller.selectedAddons]
// // //       : [];
// // //     selectedAddons = selectedAddons.filter((a) => a.trainIndex !== trainIndex);

// // //     if (!addonId) {
// // //       updated[travellerIndex].selectedAddons = selectedAddons;
// // //       setTravellers(updated);
// // //       return;
// // //     }

// // //     const selectedAddon = train.addons?.find(
// // //       (a) => String(a._id || a.id) === String(addonId),
// // //     );
// // //     if (!selectedAddon) {
// // //       updated[travellerIndex].selectedAddons = selectedAddons;
// // //       setTravellers(updated);
// // //       return;
// // //     }

// // //     selectedAddons.push({
// // //       trainIndex,
// // //       trainNo: train.trainNo,
// // //       trainName: train.trainName,
// // //       tripType: train.tripType,
// // //       addonId: selectedAddon._id || selectedAddon.id,
// // //       name: selectedAddon.name,
// // //       amount: Number(selectedAddon.amount) || 0,
// // //       addedAt: new Date(),
// // //     });

// // //     updated[travellerIndex].selectedAddons = selectedAddons;
// // //     setTravellers(updated);
// // //   };

// // //   const handleFlightAddonChange = (travellerIndex, flightIndex, addonId) => {
// // //     const updated = [...travellers];
// // //     const traveller = updated[travellerIndex];
// // //     const selectedPackage =
// // //       traveller.packageType === "main"
// // //         ? tourInfo
// // //         : tourInfo.variantPackage?.[traveller.variantPackageIndex];
// // //     const flight = selectedPackage?.flightDetails?.[flightIndex];
// // //     if (!flight) return;

// // //     let selectedAddons = Array.isArray(traveller.selectedAddons)
// // //       ? [...traveller.selectedAddons]
// // //       : [];
// // //     selectedAddons = selectedAddons.filter((a) => a.flightIndex !== flightIndex);

// // //     if (!addonId) {
// // //       updated[travellerIndex].selectedAddons = selectedAddons;
// // //       setTravellers(updated);
// // //       return;
// // //     }

// // //     const selectedAddon = flight.addons?.find(
// // //       (a) => String(a._id || a.id) === String(addonId),
// // //     );
// // //     if (!selectedAddon) {
// // //       updated[travellerIndex].selectedAddons = selectedAddons;
// // //       setTravellers(updated);
// // //       return;
// // //     }

// // //     selectedAddons.push({
// // //       flightIndex,
// // //       flightNo: flight.flightNo,
// // //       airline: flight.airline,
// // //       tripType: flight.tripType,
// // //       addonId: selectedAddon._id || selectedAddon.id,
// // //       name: selectedAddon.name,
// // //       amount: Number(selectedAddon.amount) || 0,
// // //       addedAt: new Date(),
// // //     });

// // //     updated[travellerIndex].selectedAddons = selectedAddons;
// // //     setTravellers(updated);
// // //   };

// // //   const handleFlatAddonSelect = (travellerIndex, addonId, flatAddonsList) => {
// // //     const updated = [...travellers];
// // //     if (!addonId) {
// // //       updated[travellerIndex].selectedAddon = null;
// // //       setTravellers(updated);
// // //       return;
// // //     }
// // //     const selected = flatAddonsList.find(
// // //       (a) => String(a._id || a.id) === String(addonId),
// // //     );
// // //     updated[travellerIndex].selectedAddon = selected
// // //       ? { name: selected.name, price: Number(selected.amount) || 0 }
// // //       : null;
// // //     setTravellers(updated);
// // //   };

// // //   const getSelectedFlatAddonId = (traveller, flatAddonsList) => {
// // //     const flat = traveller?.selectedAddon;
// // //     if (!flat?.name) return "";
// // //     const match = (flatAddonsList || []).find((a) => a.name === flat.name);
// // //     return match ? String(match._id || match.id) : "";
// // //   };

// // //   const getSelectedAddonForTrain = (traveller, trainIndex) => {
// // //     const selectedAddons = Array.isArray(traveller.selectedAddons)
// // //       ? traveller.selectedAddons
// // //       : [];
// // //     return (
// // //       selectedAddons.find((a) => a.trainIndex === trainIndex)?.addonId || ""
// // //     );
// // //   };

// // //   const getSelectedAddonForFlight = (traveller, flightIndex) => {
// // //     const selectedAddons = Array.isArray(traveller.selectedAddons)
// // //       ? traveller.selectedAddons
// // //       : [];
// // //     return (
// // //       selectedAddons.find((a) => a.flightIndex === flightIndex)?.addonId || ""
// // //     );
// // //   };

// // //   const handleAddToTrolly = async () => {
// // //     if (!tourId) {
// // //       toast.error("Select a tour first");
// // //       return;
// // //     }

// // //     setIsSubmitting(true);

// // //     for (let [idx, t] of travellers.entries()) {
// // //       const age = Number(t.age);

// // //       if (!t.firstName?.trim()) {
// // //         toast.error(`Traveller ${idx + 1}: First Name is required (As per Aadhar).`);
// // //         setIsSubmitting(false);
// // //         return;
// // //       }
// // //       if (!t.lastName?.trim()) {
// // //         toast.error(`Traveller ${idx + 1}: Last Name is required (As per Aadhar).`);
// // //         setIsSubmitting(false);
// // //         return;
// // //       }
// // //       if (isNaN(age) || age < 1) {
// // //         toast.error(`Invalid age for traveller: ${t.firstName || "Unnamed"}.`);
// // //         setIsSubmitting(false);
// // //         return;
// // //       }
// // //       if (!t.gender) {
// // //         toast.error("Please select gender for all travellers.");
// // //         setIsSubmitting(false);
// // //         return;
// // //       }
// // //       if (!t.sharingType) {
// // //         toast.error("Please select a sharing type for all travellers.");
// // //         setIsSubmitting(false);
// // //         return;
// // //       }
// // //       if (!t.boardingPoint) {
// // //         toast.error("Please select a boarding point for all travellers.");
// // //         setIsSubmitting(false);
// // //         return;
// // //       }
// // //       if (!t.deboardingPoint) {
// // //         toast.error("Please select a deboarding point for all travellers.");
// // //         setIsSubmitting(false);
// // //         return;
// // //       }
// // //       if (t.packageType === "variant" && t.variantPackageIndex === null) {
// // //         toast.error(`Please select a variant package for traveller: ${t.firstName}.`);
// // //         setIsSubmitting(false);
// // //         return;
// // //       }
// // //     }

// // //     const billingData =
// // //       billingAddress.addressLine1.trim() ||
// // //       billingAddress.city.trim() ||
// // //       billingAddress.state.trim() ||
// // //       billingAddress.pincode.trim()
// // //         ? billingAddress
// // //         : null;

// // //     try {
// // //       const payload = {
// // //         tourId,
// // //         bookingType,
// // //         contact,
// // //         billingAddress: billingData,

// // //         travellers: travellers.map((t) => ({
// // //           title: t.title,
// // //           firstName: t.firstName?.trim(),
// // //           lastName: t.lastName?.trim(),
// // //           age: Number(t.age),
// // //           gender: t.gender,
// // //           packageType: t.packageType,
// // //           variantPackageIndex:
// // //             t.packageType === "variant" ? t.variantPackageIndex : null,
// // //           sharingType: t.sharingType,
// // //           boardingPoint: t.boardingPoint,
// // //           deboardingPoint: t.deboardingPoint,
// // //           remarks: t.remarks?.trim() || null,

// // //           selectedAddon: t.selectedAddon
// // //             ? { name: t.selectedAddon.name, price: Number(t.selectedAddon.price) || 0 }
// // //             : null,
// // //           selectedAddons: Array.isArray(t.selectedAddons)
// // //             ? t.selectedAddons.map((a) => ({
// // //                 trainIndex: a.trainIndex,
// // //                 trainNo: a.trainNo,
// // //                 trainName: a.trainName,
// // //                 flightIndex: a.flightIndex,
// // //                 flightNo: a.flightNo,
// // //                 airline: a.airline,
// // //                 tripType: a.tripType,
// // //                 addonId: a.addonId,
// // //                 name: a.name,
// // //                 amount: Number(a.amount) || 0,
// // //               }))
// // //             : [],

// // //           // Admin/Aadhaar-OCR tracking — carried through as-is.
// // //           isCoTraveller: !!t.isCoTraveller,
// // //           aadhaar: t._aadhaar || null,
// // //         })),

// // //         payment: {
// // //           advance: { amount: amounts.advance },
// // //           balance: { amount: amounts.balance },
// // //         },

// // //         paymentScreenshots,
// // //       };

// // //       const data = await adminAddBooking(payload);

// // //       if (data.success) {
// // //         navigate("/admin-bookings");
// // //       }
// // //     } catch (error) {
// // //       console.error(error);
// // //       toast.error("Booking failed. Please check traveller details.");
// // //     } finally {
// // //       setIsSubmitting(false);
// // //     }
// // //   };

// // //   // ── No tour picked yet (direct nav, Format 1 before selection) ──
// // //   if (!tourId) {
// // //     return (
// // //       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
// // //         <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-10 max-w-lg w-full">
// // //           <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
// // //             Create Booking
// // //           </h1>
// // //           <label className="block text-base font-medium text-gray-800 mb-2">
// // //             Select Tour *
// // //           </label>
// // //           <select
// // //             value={tourId}
// // //             onChange={(e) => setTourId(e.target.value)}
// // //             className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
// // //           >
// // //             <option value="">-- Select a tour --</option>
// // //             {tourList?.map((t) => (
// // //               <option key={t._id} value={t._id}>
// // //                 {t.title}
// // //               </option>
// // //             ))}
// // //           </select>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   if (!tourInfo) {
// // //     return (
// // //       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
// // //         <p className="text-xl text-gray-600 animate-pulse">Loading tour details...</p>
// // //       </div>
// // //     );
// // //   }

// // //   const formatDate = (dateString) => {
// // //     if (!dateString) return "Not specified";
// // //     return new Date(dateString).toLocaleDateString("en-IN", {
// // //       day: "numeric",
// // //       month: "long",
// // //       year: "numeric",
// // //     });
// // //   };

// // //   return (
// // //     <div
// // //       className="
// // //         w-full
// // //         max-w-[98%] xs:max-w-[96%] sm:max-w-[98%] md:max-w-[96vw]
// // //         lg:max-w-[94vw] xl:max-w-[92vw] 2xl:max-w-[90vw]
// // //         rounded-3xl sm:rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[3.5rem] xl:rounded-[4rem]
// // //         backdrop-blur-xl bg-white/40 border border-white/50
// // //         shadow-2xl md:shadow-[0_30px_90px_-15px_rgba(0,0,0,0.12)]
// // //         overflow-hidden
// // //         p-8 xs:p-10 sm:p-12 md:p-16 lg:p-20 xl:p-24
// // //       "
// // //     >
// // //       <div className="max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto">
// // //         <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 md:mb-10 text-center transition-all duration-500 hover:shadow-xl">
// // //           <div className="flex justify-between items-center mb-4">
// // //             <button
// // //               onClick={() => setTourId("")}
// // //               className="text-sm text-indigo-600 hover:underline font-medium"
// // //             >
// // //               ← Change Tour
// // //             </button>
// // //           </div>

// // //           <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
// // //             {tourInfo.title}
// // //           </h1>
// // //           <p className="text-lg sm:text-xl text-gray-600 mb-4">
// // //             {tourInfo.duration?.days} Days / {tourInfo.duration?.nights} Nights
// // //           </p>

// // //           <div className="mb-6">
// // //             <p className="text-base sm:text-lg font-medium text-gray-700">
// // //               Main Package Departure
// // //             </p>
// // //             <p className="text-lg sm:text-xl text-indigo-700 font-semibold">
// // //               {formatDate(tourInfo.lastBookingDate)}
// // //             </p>
// // //           </div>

// // //           {tourInfo.variantPackage && tourInfo.variantPackage.length > 0 && (
// // //             <div className="mt-6 pt-6 border-t border-gray-200">
// // //               <p className="text-base sm:text-lg font-medium text-gray-700 mb-4">
// // //                 Variant Package Departures
// // //               </p>
// // //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// // //                 {tourInfo.variantPackage.map((variant, i) => (
// // //                   <div key={i} className="bg-indigo-50/70 rounded-xl p-4 text-left">
// // //                     <p className="text-sm sm:text-base font-medium text-gray-800">
// // //                       Variant {i + 1}
// // //                     </p>
// // //                     {variant.destination && (
// // //                       <p className="text-sm text-gray-600 mt-1">
// // //                         {variant.destination.join(", ")}
// // //                       </p>
// // //                     )}
// // //                     <p className="text-base sm:text-lg text-indigo-700 font-semibold mt-2">
// // //                       Departure: {formatDate(variant.lastBookingDate)}
// // //                     </p>
// // //                   </div>
// // //                 ))}
// // //               </div>
// // //             </div>
// // //           )}
// // //         </div>

// // //         {incoming.travellers?.length > 0 && (
// // //           <div className="mb-8 px-6 py-4 bg-blue-50 border border-blue-300 rounded-2xl text-blue-900 shadow-md text-center font-medium">
// // //             Pre-filled from Aadhaar Upload — verify and complete the remaining
// // //             booking details below.
// // //           </div>
// // //         )}

// // //         <div className="space-y-6 sm:space-y-8">
// // //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
// // //             <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl">
// // //               <label className="block text-base sm:text-lg font-medium text-gray-800 mb-2 sm:mb-3">
// // //                 Contact Email
// // //               </label>
// // //               <input
// // //                 type="email"
// // //                 className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none"
// // //                 placeholder="your@email.com"
// // //                 value={contact.email}
// // //                 onChange={(e) =>
// // //                   setContact((prev) => ({ ...prev, email: e.target.value }))
// // //                 }
// // //               />
// // //             </div>
// // //             <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl">
// // //               <label className="block text-base sm:text-lg font-medium text-gray-800 mb-2 sm:mb-3">
// // //                 Mobile Number
// // //               </label>
// // //               <input
// // //                 type="tel"
// // //                 className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none"
// // //                 placeholder="Mobile number"
// // //                 value={contact.mobile}
// // //                 onChange={(e) =>
// // //                   setContact((prev) => ({ ...prev, mobile: e.target.value }))
// // //                 }
// // //               />
// // //             </div>
// // //           </div>

// // //           <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl">
// // //             <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
// // //               Billing Address (Optional)
// // //             </h3>
// // //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
// // //               {[
// // //                 ["addressLine1", "Address Line 1"],
// // //                 ["addressLine2", "Address Line 2"],
// // //                 ["city", "City"],
// // //                 ["state", "State"],
// // //                 ["pincode", "Pincode"],
// // //                 ["country", "Country"],
// // //               ].map(([field, placeholder]) => (
// // //                 <input
// // //                   key={field}
// // //                   type="text"
// // //                   placeholder={placeholder}
// // //                   className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// // //                   value={billingAddress[field]}
// // //                   onChange={(e) =>
// // //                     setBillingAddress((prev) => ({
// // //                       ...prev,
// // //                       [field]: e.target.value,
// // //                     }))
// // //                   }
// // //                 />
// // //               ))}
// // //             </div>
// // //           </div>

// // //           {Object.keys(paymentScreenshots).length > 0 && (
// // //             <div className="bg-green-50/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg border border-green-200">
// // //               <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-3">
// // //                 Payment Screenshots (from Aadhaar Upload)
// // //               </h3>
// // //               <div className="flex flex-wrap gap-3 text-sm text-green-800">
// // //                 {Object.entries(paymentScreenshots).map(([slot, data]) => (
// // //                   <span
// // //                     key={slot}
// // //                     className="px-3 py-1.5 bg-white rounded-lg border border-green-200 capitalize"
// // //                   >
// // //                     {slot}
// // //                     {data.amount ? ` — ${currencySymbol}${data.amount}` : ""} ✓
// // //                   </span>
// // //                 ))}
// // //               </div>
// // //             </div>
// // //           )}

// // //           <div>
// // //             <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
// // //               Traveller Details
// // //             </h2>

// // //             {travellers.map((traveller, index) => {
// // //               const selectedPackage =
// // //                 traveller.packageType === "main"
// // //                   ? tourInfo
// // //                   : tourInfo.variantPackage?.[traveller.variantPackageIndex];

// // //               const trainDetails = selectedPackage?.trainDetails || [];
// // //               const flightDetailsAll = selectedPackage?.flightDetails || [];

// // //               const flightsWithAddons = flightDetailsAll
// // //                 .map((flight, flightIndexInPackage) => ({ flight, flightIndexInPackage }))
// // //                 .filter(
// // //                   ({ flight }) =>
// // //                     Array.isArray(flight.addons) && flight.addons.length > 0,
// // //                 );

// // //               const trainAddonsExist = trainDetails.some(
// // //                 (t) => Array.isArray(t.addons) && t.addons.length > 0,
// // //               );
// // //               const flightAddonsExist = flightsWithAddons.length > 0;
// // //               const hasLegAddons = trainAddonsExist || flightAddonsExist;
// // //               const flatAddons = selectedPackage?.addons || [];

// // //               return (
// // //                 <div
// // //                   key={index}
// // //                   className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 sm:p-8 mb-4 sm:mb-6 transition-all duration-500 hover:shadow-xl border border-indigo-100"
// // //                 >
// // //                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
// // //                     <h3 className="text-lg sm:text-xl font-semibold text-indigo-800 flex items-center gap-2">
// // //                       Traveller {index + 1}
// // //                       {traveller.isCoTraveller && (
// // //                         <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
// // //                           Aadhaar OCR
// // //                         </span>
// // //                       )}
// // //                     </h3>
// // //                     {travellers.length > 1 && (
// // //                       <button
// // //                         onClick={() => removeTraveller(index)}
// // //                         className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
// // //                       >
// // //                         Remove Traveller
// // //                       </button>
// // //                     )}
// // //                   </div>

// // //                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mb-4 sm:mb-6">
// // //                     <select
// // //                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// // //                       value={
// // //                         traveller.packageType === "main"
// // //                           ? "main"
// // //                           : traveller.variantPackageIndex
// // //                       }
// // //                       onChange={(e) => {
// // //                         const value = e.target.value;
// // //                         if (value === "main") {
// // //                           handleTravellerChange(index, "packageType", "main");
// // //                           handleTravellerChange(index, "variantPackageIndex", null);
// // //                         } else {
// // //                           handleTravellerChange(index, "packageType", "variant");
// // //                           handleTravellerChange(index, "variantPackageIndex", Number(value));
// // //                         }
// // //                       }}
// // //                     >
// // //                       <option value="main">Main Package</option>
// // //                       {tourInfo.variantPackage?.map((pkg, i) => (
// // //                         <option key={i} value={i}>
// // //                           Variant {i + 1} ({pkg.destination?.join(", ")})
// // //                         </option>
// // //                       ))}
// // //                     </select>

// // //                     <select
// // //                       value={traveller.title}
// // //                       onChange={(e) => handleTravellerChange(index, "title", e.target.value)}
// // //                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// // //                     >
// // //                       <option>Mr</option>
// // //                       <option>Mrs</option>
// // //                       <option>Ms</option>
// // //                     </select>

// // //                     <input
// // //                       type="text"
// // //                       placeholder="First Name (As per Aadhar)"
// // //                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// // //                       value={traveller.firstName}
// // //                       onChange={(e) => handleTravellerChange(index, "firstName", e.target.value)}
// // //                     />

// // //                     <input
// // //                       type="text"
// // //                       placeholder="Last Name (As per Aadhar)"
// // //                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// // //                       value={traveller.lastName}
// // //                       onChange={(e) => handleTravellerChange(index, "lastName", e.target.value)}
// // //                     />

// // //                     <input
// // //                       type="number"
// // //                       placeholder="Age"
// // //                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// // //                       value={traveller.age}
// // //                       onChange={(e) => handleTravellerChange(index, "age", e.target.value)}
// // //                     />

// // //                     <select
// // //                       value={traveller.gender}
// // //                       onChange={(e) => handleTravellerChange(index, "gender", e.target.value)}
// // //                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// // //                     >
// // //                       <option value="">Gender</option>
// // //                       <option>Male</option>
// // //                       <option>Female</option>
// // //                       <option>Other</option>
// // //                     </select>
// // //                   </div>

// // //                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-6">
// // //                     <div>
// // //                       <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
// // //                         Boarding Point
// // //                       </label>
// // //                       <select
// // //                         className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// // //                         value={getPointId(traveller.boardingPoint)}
// // //                         onChange={(e) => {
// // //                           const pkg =
// // //                             traveller.packageType === "main"
// // //                               ? tourInfo
// // //                               : tourInfo.variantPackage?.[traveller.variantPackageIndex];
// // //                           const selectedBP = pkg?.boardingPoints?.find(
// // //                             (bp) => getPointId(bp) === e.target.value,
// // //                           );
// // //                           handleTravellerChange(index, "boardingPoint", selectedBP || null);
// // //                         }}
// // //                       >
// // //                         <option value="">Select Boarding Point</option>
// // //                         {(traveller.packageType === "main"
// // //                           ? tourInfo.boardingPoints
// // //                           : tourInfo.variantPackage?.[traveller.variantPackageIndex]
// // //                               ?.boardingPoints || []
// // //                         )?.map((bp, i) => (
// // //                           <option key={getPointId(bp) || i} value={getPointId(bp)}>
// // //                             {bp.stationCode} - {bp.stationName}
// // //                           </option>
// // //                         ))}
// // //                       </select>
// // //                     </div>

// // //                     <div>
// // //                       <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
// // //                         Deboarding Point
// // //                       </label>
// // //                       <select
// // //                         className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// // //                         value={getPointId(traveller.deboardingPoint)}
// // //                         onChange={(e) => {
// // //                           const pkg =
// // //                             traveller.packageType === "main"
// // //                               ? tourInfo
// // //                               : tourInfo.variantPackage?.[traveller.variantPackageIndex];
// // //                           const selectedDP = pkg?.deboardingPoints?.find(
// // //                             (dp) => getPointId(dp) === e.target.value,
// // //                           );
// // //                           handleTravellerChange(index, "deboardingPoint", selectedDP || null);
// // //                         }}
// // //                       >
// // //                         <option value="">Select Deboarding Point</option>
// // //                         {(traveller.packageType === "main"
// // //                           ? tourInfo.deboardingPoints
// // //                           : tourInfo.variantPackage?.[traveller.variantPackageIndex]
// // //                               ?.deboardingPoints || []
// // //                         )?.map((dp, i) => (
// // //                           <option key={getPointId(dp) || i} value={getPointId(dp)}>
// // //                             {dp.stationCode} - {dp.stationName}
// // //                           </option>
// // //                         ))}
// // //                       </select>
// // //                     </div>
// // //                   </div>

// // //                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-6">
// // //                     <div>
// // //                       <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
// // //                         Sharing Type
// // //                       </label>
// // //                       <select
// // //                         value={traveller.sharingType}
// // //                         onChange={(e) => handleTravellerChange(index, "sharingType", e.target.value)}
// // //                         className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// // //                       >
// // //                         <option value="">Select Sharing</option>
// // //                         {Number(traveller.age) >= 11 ? (
// // //                           <>
// // //                             <option value="double">Double Sharing</option>
// // //                             <option value="triple">Triple Sharing</option>
// // //                           </>
// // //                         ) : Number(traveller.age) >= 6 && Number(traveller.age) <= 10 ? (
// // //                           <>
// // //                             <option value="withBerth">Child with Berth</option>
// // //                             <option value="withoutBerth">Child without Berth</option>
// // //                           </>
// // //                         ) : null}
// // //                       </select>
// // //                     </div>

// // //                     {!hasLegAddons && flatAddons.length > 0 && (
// // //                       <div>
// // //                         <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
// // //                           Add-ons (Optional)
// // //                         </label>
// // //                         <select
// // //                           className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// // //                           value={getSelectedFlatAddonId(traveller, flatAddons)}
// // //                           onChange={(e) => handleFlatAddonSelect(index, e.target.value, flatAddons)}
// // //                         >
// // //                           <option value="">No Add-on</option>
// // //                           {flatAddons.map((addon) => (
// // //                             <option key={addon._id || addon.id} value={addon._id || addon.id}>
// // //                               {addon.name} (+{currencySymbol}{addon.amount || 0})
// // //                             </option>
// // //                           ))}
// // //                         </select>
// // //                       </div>
// // //                     )}
// // //                   </div>

// // //                   {hasLegAddons && (
// // //                     <>
// // //                       <div className="mt-6 pt-6 border-t border-gray-200">
// // //                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
// // //                           <div>
// // //                             <div className="flex items-center gap-2">
// // //                               <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-lg">
// // //                                 🚆
// // //                               </div>
// // //                               <h3 className="text-lg sm:text-xl font-bold text-gray-800">
// // //                                 TRAIN WISE ADD-ONS
// // //                               </h3>
// // //                             </div>
// // //                             <p className="text-sm text-gray-500 mt-1">
// // //                               Select add-ons for each trip
// // //                             </p>
// // //                           </div>
// // //                           <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
// // //                             <span className="text-sm font-semibold text-gray-600">TOTAL ADD ONS:</span>
// // //                             <span className="ml-2 text-base font-bold text-indigo-700">
// // //                               {currencySymbol}
// // //                               {(traveller.selectedAddons || []).reduce(
// // //                                 (total, addon) => total + (Number(addon.amount) || 0),
// // //                                 0,
// // //                               )}
// // //                             </span>
// // //                           </div>
// // //                         </div>

// // //                         {trainDetails.length > 0 ? (
// // //                           <div className="space-y-3">
// // //                             {trainDetails.map((train, trainIndex) => {
// // //                               const trainAddons = train.addons || [];
// // //                               return (
// // //                                 <div
// // //                                   key={train._id || trainIndex}
// // //                                   className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white hover:border-indigo-200 transition-all"
// // //                                 >
// // //                                   <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_300px] gap-4 items-center">
// // //                                     <div className="flex md:justify-center">
// // //                                       <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
// // //                                         {String(trainIndex + 1).padStart(2, "0")}
// // //                                       </div>
// // //                                     </div>
// // //                                     <div>
// // //                                       {train.tripType && (
// // //                                         <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase">
// // //                                           {train.tripType}
// // //                                         </span>
// // //                                       )}
// // //                                       <h4 className="text-base sm:text-lg font-semibold text-gray-800">
// // //                                         {train.trainName}{" "}
// // //                                         <span className="text-gray-500 font-medium">({train.trainNo})</span>
// // //                                       </h4>
// // //                                       <p className="text-sm text-gray-500 mt-1">
// // //                                         {train.fromStation}
// // //                                         <span className="mx-2 text-gray-400">→</span>
// // //                                         {train.toStation}
// // //                                       </p>
// // //                                     </div>
// // //                                     <div>
// // //                                       <label className="block text-sm font-medium text-gray-700 mb-1.5">
// // //                                         Add-on
// // //                                       </label>
// // //                                       <select
// // //                                         className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
// // //                                         value={getSelectedAddonForTrain(traveller, trainIndex)}
// // //                                         onChange={(e) => handleAddonChange(index, trainIndex, e.target.value)}
// // //                                       >
// // //                                         <option value="">No Add-on</option>
// // //                                         {trainAddons.map((addon) => (
// // //                                           <option key={addon._id || addon.id} value={addon._id || addon.id}>
// // //                                             {addon.name} ({currencySymbol}{addon.amount || 0})
// // //                                           </option>
// // //                                         ))}
// // //                                       </select>
// // //                                     </div>
// // //                                   </div>
// // //                                 </div>
// // //                               );
// // //                             })}
// // //                           </div>
// // //                         ) : (
// // //                           <div className="border border-dashed border-gray-300 rounded-xl p-5 text-center">
// // //                             <p className="text-sm text-gray-500">No train / trip details available.</p>
// // //                           </div>
// // //                         )}
// // //                       </div>

// // //                       {flightsWithAddons.length > 0 && (
// // //                         <div className="mt-6 pt-6 border-t border-gray-200">
// // //                           <div className="flex items-center gap-2 mb-4">
// // //                             <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 text-lg">
// // //                               ✈️
// // //                             </div>
// // //                             <h3 className="text-lg sm:text-xl font-bold text-gray-800">
// // //                               FLIGHT WISE ADD-ONS
// // //                             </h3>
// // //                           </div>
// // //                           <div className="space-y-3">
// // //                             {flightsWithAddons.map(({ flight, flightIndexInPackage }) => (
// // //                               <div
// // //                                 key={flight._id || flightIndexInPackage}
// // //                                 className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white hover:border-purple-200 transition-all"
// // //                               >
// // //                                 <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_300px] gap-4 items-center">
// // //                                   <div className="flex md:justify-center">
// // //                                     <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
// // //                                       {String(flightIndexInPackage + 1).padStart(2, "0")}
// // //                                     </div>
// // //                                   </div>
// // //                                   <div>
// // //                                     {flight.tripType && (
// // //                                       <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold uppercase">
// // //                                         {flight.tripType}
// // //                                       </span>
// // //                                     )}
// // //                                     <h4 className="text-base sm:text-lg font-semibold text-gray-800">
// // //                                       {flight.airline}{" "}
// // //                                       <span className="text-gray-500 font-medium">({flight.flightNo})</span>
// // //                                     </h4>
// // //                                     <p className="text-sm text-gray-500 mt-1">
// // //                                       {flight.fromAirport}
// // //                                       <span className="mx-2 text-gray-400">→</span>
// // //                                       {flight.toAirport}
// // //                                     </p>
// // //                                   </div>
// // //                                   <div>
// // //                                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
// // //                                       Add-on
// // //                                     </label>
// // //                                     <select
// // //                                       className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all"
// // //                                       value={getSelectedAddonForFlight(traveller, flightIndexInPackage)}
// // //                                       onChange={(e) =>
// // //                                         handleFlightAddonChange(index, flightIndexInPackage, e.target.value)
// // //                                       }
// // //                                     >
// // //                                       <option value="">No Add-on</option>
// // //                                       {(flight.addons || []).map((addon) => (
// // //                                         <option key={addon._id || addon.id} value={addon._id || addon.id}>
// // //                                           {addon.name} ({currencySymbol}{addon.amount || 0})
// // //                                         </option>
// // //                                       ))}
// // //                                     </select>
// // //                                   </div>
// // //                                 </div>
// // //                               </div>
// // //                             ))}
// // //                           </div>
// // //                         </div>
// // //                       )}
// // //                     </>
// // //                   )}

// // //                   <textarea
// // //                     className="w-full mt-6 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 resize-none"
// // //                     rows="3"
// // //                     placeholder="Remarks (optional)"
// // //                     value={traveller.remarks}
// // //                     onChange={(e) => handleTravellerChange(index, "remarks", e.target.value)}
// // //                   />
// // //                 </div>
// // //               );
// // //             })}

// // //             <button
// // //               onClick={addTraveller}
// // //               className="bg-indigo-100 text-indigo-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:bg-indigo-200 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto"
// // //             >
// // //               + Add Another Traveller
// // //             </button>
// // //           </div>

// // //           <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
// // //             <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
// // //               Booking Summary
// // //             </h3>
// // //             <div className="space-y-3 sm:space-y-5 text-base sm:text-lg text-gray-700">
// // //               <div className="flex justify-between">
// // //                 <span>Advance Amount:</span>
// // //                 <strong className="text-indigo-700">{currencySymbol}{amounts.advance}/-</strong>
// // //               </div>
// // //               <div className="flex justify-between">
// // //                 <span>Balance Amount:</span>
// // //                 <strong className="text-indigo-700">{currencySymbol}{amounts.balance}/-</strong>
// // //               </div>
// // //               <div className="flex justify-between">
// // //                 <span>Add-ons Total:</span>
// // //                 <strong className="text-indigo-700">{currencySymbol}{amounts.addonsTotal}/-</strong>
// // //               </div>
// // //               <hr className="border-gray-200" />
// // //               <div className="flex justify-between text-xl sm:text-2xl font-bold text-gray-800 pt-2 sm:pt-3">
// // //                 <span>Total Payable:</span>
// // //                 <span className="text-indigo-800">{currencySymbol}{amounts.advance + amounts.balance}/-</span>
// // //               </div>
// // //             </div>
// // //           </div>

// // //           <button
// // //             onClick={handleAddToTrolly}
// // //             disabled={isSubmitting}
// // //             className={`w-full py-4 sm:py-5 rounded-2xl text-white font-bold text-lg sm:text-xl transition-all duration-500 transform hover:scale-[1.02] shadow-xl ${
// // //               isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
// // //             } ${isSubmitting ? "" : "hover:shadow-2xl"}`}
// // //           >
// // //             {isSubmitting ? (
// // //               <span className="flex items-center justify-center gap-3">
// // //                 <svg className="animate-spin h-5 sm:h-6 w-5 sm:w-6" viewBox="0 0 24 24">
// // //                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
// // //                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
// // //                 </svg>
// // //                 Adding to Trolly...
// // //               </span>
// // //             ) : (
// // //               "Add to Trolly"
// // //             )}
// // //           </button>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default CreateBooking;


// // import React, { useContext, useEffect, useState } from "react";
// // import { useNavigate, useLocation } from "react-router-dom";
// // import { TourContext } from "../../context/TourContext";
// // import { toast } from "react-toastify";

// // // stationCode is NOT guaranteed unique within a tour's boardingPoints /
// // // deboardingPoints array (same mirrors the customer-facing TourBooking.jsx
// // // fix) — select/match by each point's own _id instead.
// // const getPointId = (point) => {
// //   if (!point) return "";
// //   const raw = point._id;
// //   if (raw && typeof raw === "object" && raw.$oid) return String(raw.$oid);
// //   return raw !== undefined && raw !== null ? String(raw) : "";
// // };

// // // Blank traveller — same shape as the customer-facing booking form, plus
// // // two admin-only fields: isCoTraveller/aadhaar (hidden, not rendered,
// // // forwarded as-is to the backend) that track whether this traveller came
// // // through Aadhaar OCR on the Aadhaar Upload page.
// // const blankTraveller = () => ({
// //   title: "Mr",
// //   firstName: "",
// //   lastName: "",
// //   age: "",
// //   gender: "Male",
// //   sharingType: "",
// //   selectedAddon: null,
// //   selectedAddons: [],
// //   boardingPoint: null,
// //   deboardingPoint: null,
// //   remarks: "",
// //   packageType: "main",
// //   variantPackageIndex: null,
// //   isCoTraveller: false,
// //   _aadhaar: null, // { front, back } once OCR'd — never rendered, just carried through
// // });

// // // Merge an OCR-prefilled traveller (from AadhaarUpload: title/firstName/
// // // lastName/age/gender/isCoTraveller/_aadhaar only) onto the full blank
// // // shape so every booking-specific field the admin still has to fill
// // // (package, sharing, boarding/deboarding, addons, remarks) is present.
// // const hydrateTraveller = (partial) => ({
// //   ...blankTraveller(),
// //   ...partial,
// // });

// // const CreateBooking = () => {
// //   const location = useLocation();
// //   const navigate = useNavigate();

// //   const {
// //     tourList,
// //     getTourList,
// //     currencySymbol,
// //     adminAddBooking,
// //   } = useContext(TourContext);

// //   // ── Format 1: direct nav (no state) → manual booking, admin picks the
// //   // tour from the dropdown below.
// //   // ── Format 2: nav'd from AadhaarUpload with { tourId, travellers,
// //   // paymentScreenshots } in state → everything pre-filled.
// //   const incoming = location.state || {};

// //   const [tourId, setTourId] = useState(incoming.tourId || "");
// //   const [tourInfo, setTourInfo] = useState(null);
// //   const [bookingType] = useState("offline"); // admin walk-ins are always offline/in-person
// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   const [travellers, setTravellers] = useState(
// //     incoming.travellers?.length > 0
// //       ? incoming.travellers.map(hydrateTraveller)
// //       : [blankTraveller()],
// //   );

// //   const [paymentScreenshots] = useState(incoming.paymentScreenshots || {});

// //   const [amounts, setAmounts] = useState({
// //     advance: 0,
// //     balance: 0,
// //     addonsTotal: 0,
// //   });

// //   const [contact, setContact] = useState({ email: "", mobile: "" });

// //   const [billingAddress, setBillingAddress] = useState({
// //     addressLine1: "",
// //     addressLine2: "",
// //     city: "",
// //     state: "",
// //     pincode: "",
// //     country: "India",
// //   });

// //   useEffect(() => {
// //     if (!tourList || tourList.length === 0) getTourList();
// //   }, [tourList, getTourList]);

// //   useEffect(() => {
// //     if (!tourId || !tourList?.length) {
// //       setTourInfo(null);
// //       return;
// //     }
// //     const t = tourList.find((tour) => tour._id === tourId);
// //     setTourInfo(t || null);
// //   }, [tourId, tourList]);

// //   useEffect(() => {
// //     if (!tourInfo) return;

// //     let totalAdvance = 0;
// //     let totalBalance = 0;
// //     let totalAddons = 0;

// //     travellers.forEach((t) => {
// //       const age = Number(t.age);
// //       let travellerAdvance = 0;
// //       let travellerBalance = 0;

// //       const selectedPackage =
// //         t.packageType === "main"
// //           ? tourInfo
// //           : tourInfo.variantPackage?.[t.variantPackageIndex];

// //       if (!selectedPackage) return;

// //       if (age >= 11) {
// //         travellerAdvance = Number(selectedPackage.advanceAmount?.adult) || 0;
// //         if (t.sharingType === "double") {
// //           travellerBalance = Number(selectedPackage.balanceDouble) || 0;
// //         } else if (t.sharingType === "triple") {
// //           travellerBalance = Number(selectedPackage.balanceTriple) || 0;
// //         }
// //       } else if (age >= 6 && age <= 10) {
// //         travellerAdvance = Number(selectedPackage.advanceAmount?.child) || 0;
// //         if (t.sharingType === "withBerth") {
// //           travellerBalance = Number(selectedPackage.balanceChildWithBerth) || 0;
// //         } else if (t.sharingType === "withoutBerth") {
// //           travellerBalance =
// //             Number(selectedPackage.balanceChildWithoutBerth) || 0;
// //         }
// //       }

// //       const travellerAddons = Array.isArray(t.selectedAddons)
// //         ? t.selectedAddons
// //         : [];
// //       travellerAddons.forEach((addon) => {
// //         const addonPrice = Number(addon.amount) || 0;
// //         totalAddons += addonPrice;
// //         travellerAdvance += addonPrice;
// //       });

// //       const flatAddonPrice = Number(t.selectedAddon?.price) || 0;
// //       totalAddons += flatAddonPrice;
// //       travellerAdvance += flatAddonPrice;

// //       totalAdvance += travellerAdvance;
// //       totalBalance += travellerBalance;
// //     });

// //     setAmounts({
// //       advance: totalAdvance,
// //       balance: totalBalance,
// //       addonsTotal: totalAddons,
// //     });
// //   }, [travellers, tourInfo]);

// //   const handleTravellerChange = (index, field, value) => {
// //     const updated = [...travellers];

// //     if (field === "title") {
// //       if (value === "Mr") updated[index].gender = "Male";
// //       else if (value === "Mrs" || value === "Ms") updated[index].gender = "Female";
// //     }
// //     if (field === "gender") {
// //       if (value === "Male") updated[index].title = "Mr";
// //       else if (value === "Female") updated[index].title = "Ms";
// //     }
// //     if (field === "age") {
// //       const age = Number(value);
// //       if (age > 85) {
// //         toast.error("Age cannot exceed 85 years.");
// //         return;
// //       }
// //       if (age >= 11) updated[index].sharingType = "double";
// //       else if (age >= 6 && age <= 10) updated[index].sharingType = "withBerth";
// //       else updated[index].sharingType = "";
// //     }

// //     updated[index][field] = value;

// //     if (field === "packageType" || field === "variantPackageIndex") {
// //       updated[index].boardingPoint = null;
// //       updated[index].deboardingPoint = null;
// //       updated[index].selectedAddon = null;
// //       updated[index].selectedAddons = [];
// //     }

// //     setTravellers(updated);
// //   };

// //   const addTraveller = () => setTravellers([...travellers, blankTraveller()]);

// //   const removeTraveller = (index) =>
// //     setTravellers(travellers.filter((_, i) => i !== index));

// //   const handleAddonChange = (travellerIndex, trainIndex, addonId) => {
// //     const updated = [...travellers];
// //     const traveller = updated[travellerIndex];
// //     const selectedPackage =
// //       traveller.packageType === "main"
// //         ? tourInfo
// //         : tourInfo.variantPackage?.[traveller.variantPackageIndex];
// //     const train = selectedPackage?.trainDetails?.[trainIndex];
// //     if (!train) return;

// //     let selectedAddons = Array.isArray(traveller.selectedAddons)
// //       ? [...traveller.selectedAddons]
// //       : [];
// //     selectedAddons = selectedAddons.filter((a) => a.trainIndex !== trainIndex);

// //     if (!addonId) {
// //       updated[travellerIndex].selectedAddons = selectedAddons;
// //       setTravellers(updated);
// //       return;
// //     }

// //     const selectedAddon = train.addons?.find(
// //       (a) => String(a._id || a.id) === String(addonId),
// //     );
// //     if (!selectedAddon) {
// //       updated[travellerIndex].selectedAddons = selectedAddons;
// //       setTravellers(updated);
// //       return;
// //     }

// //     selectedAddons.push({
// //       trainIndex,
// //       trainNo: train.trainNo,
// //       trainName: train.trainName,
// //       tripType: train.tripType,
// //       addonId: selectedAddon._id || selectedAddon.id,
// //       name: selectedAddon.name,
// //       amount: Number(selectedAddon.amount) || 0,
// //       addedAt: new Date(),
// //     });

// //     updated[travellerIndex].selectedAddons = selectedAddons;
// //     setTravellers(updated);
// //   };

// //   const handleFlightAddonChange = (travellerIndex, flightIndex, addonId) => {
// //     const updated = [...travellers];
// //     const traveller = updated[travellerIndex];
// //     const selectedPackage =
// //       traveller.packageType === "main"
// //         ? tourInfo
// //         : tourInfo.variantPackage?.[traveller.variantPackageIndex];
// //     const flight = selectedPackage?.flightDetails?.[flightIndex];
// //     if (!flight) return;

// //     let selectedAddons = Array.isArray(traveller.selectedAddons)
// //       ? [...traveller.selectedAddons]
// //       : [];
// //     selectedAddons = selectedAddons.filter((a) => a.flightIndex !== flightIndex);

// //     if (!addonId) {
// //       updated[travellerIndex].selectedAddons = selectedAddons;
// //       setTravellers(updated);
// //       return;
// //     }

// //     const selectedAddon = flight.addons?.find(
// //       (a) => String(a._id || a.id) === String(addonId),
// //     );
// //     if (!selectedAddon) {
// //       updated[travellerIndex].selectedAddons = selectedAddons;
// //       setTravellers(updated);
// //       return;
// //     }

// //     selectedAddons.push({
// //       flightIndex,
// //       flightNo: flight.flightNo,
// //       airline: flight.airline,
// //       tripType: flight.tripType,
// //       addonId: selectedAddon._id || selectedAddon.id,
// //       name: selectedAddon.name,
// //       amount: Number(selectedAddon.amount) || 0,
// //       addedAt: new Date(),
// //     });

// //     updated[travellerIndex].selectedAddons = selectedAddons;
// //     setTravellers(updated);
// //   };

// //   const handleFlatAddonSelect = (travellerIndex, addonId, flatAddonsList) => {
// //     const updated = [...travellers];
// //     if (!addonId) {
// //       updated[travellerIndex].selectedAddon = null;
// //       setTravellers(updated);
// //       return;
// //     }
// //     const selected = flatAddonsList.find(
// //       (a) => String(a._id || a.id) === String(addonId),
// //     );
// //     updated[travellerIndex].selectedAddon = selected
// //       ? { name: selected.name, price: Number(selected.amount) || 0 }
// //       : null;
// //     setTravellers(updated);
// //   };

// //   const getSelectedFlatAddonId = (traveller, flatAddonsList) => {
// //     const flat = traveller?.selectedAddon;
// //     if (!flat?.name) return "";
// //     const match = (flatAddonsList || []).find((a) => a.name === flat.name);
// //     return match ? String(match._id || match.id) : "";
// //   };

// //   const getSelectedAddonForTrain = (traveller, trainIndex) => {
// //     const selectedAddons = Array.isArray(traveller.selectedAddons)
// //       ? traveller.selectedAddons
// //       : [];
// //     return (
// //       selectedAddons.find((a) => a.trainIndex === trainIndex)?.addonId || ""
// //     );
// //   };

// //   const getSelectedAddonForFlight = (traveller, flightIndex) => {
// //     const selectedAddons = Array.isArray(traveller.selectedAddons)
// //       ? traveller.selectedAddons
// //       : [];
// //     return (
// //       selectedAddons.find((a) => a.flightIndex === flightIndex)?.addonId || ""
// //     );
// //   };

// //   const handleAddToTrolly = async () => {
// //     if (!tourId) {
// //       toast.error("Select a tour first");
// //       return;
// //     }

// //     setIsSubmitting(true);

// //     for (let [idx, t] of travellers.entries()) {
// //       const age = Number(t.age);

// //       if (!t.firstName?.trim()) {
// //         toast.error(`Traveller ${idx + 1}: First Name is required (As per Aadhar).`);
// //         setIsSubmitting(false);
// //         return;
// //       }
// //       if (!t.lastName?.trim()) {
// //         toast.error(`Traveller ${idx + 1}: Last Name is required (As per Aadhar).`);
// //         setIsSubmitting(false);
// //         return;
// //       }
// //       if (isNaN(age) || age < 1) {
// //         toast.error(`Invalid age for traveller: ${t.firstName || "Unnamed"}.`);
// //         setIsSubmitting(false);
// //         return;
// //       }
// //       if (!t.gender) {
// //         toast.error("Please select gender for all travellers.");
// //         setIsSubmitting(false);
// //         return;
// //       }
// //       if (!t.sharingType) {
// //         toast.error("Please select a sharing type for all travellers.");
// //         setIsSubmitting(false);
// //         return;
// //       }
// //       if (!t.boardingPoint) {
// //         toast.error("Please select a boarding point for all travellers.");
// //         setIsSubmitting(false);
// //         return;
// //       }
// //       if (!t.deboardingPoint) {
// //         toast.error("Please select a deboarding point for all travellers.");
// //         setIsSubmitting(false);
// //         return;
// //       }
// //       if (t.packageType === "variant" && t.variantPackageIndex === null) {
// //         toast.error(`Please select a variant package for traveller: ${t.firstName}.`);
// //         setIsSubmitting(false);
// //         return;
// //       }
// //     }

// //     const billingData =
// //       billingAddress.addressLine1.trim() ||
// //       billingAddress.city.trim() ||
// //       billingAddress.state.trim() ||
// //       billingAddress.pincode.trim()
// //         ? billingAddress
// //         : null;

// //     try {
// //       const payload = {
// //         tourId,
// //         bookingType,
// //         contact,
// //         billingAddress: billingData,

// //         travellers: travellers.map((t) => ({
// //           title: t.title,
// //           firstName: t.firstName?.trim(),
// //           lastName: t.lastName?.trim(),
// //           age: Number(t.age),
// //           gender: t.gender,
// //           packageType: t.packageType,
// //           variantPackageIndex:
// //             t.packageType === "variant" ? t.variantPackageIndex : null,
// //           sharingType: t.sharingType,
// //           boardingPoint: t.boardingPoint,
// //           deboardingPoint: t.deboardingPoint,
// //           remarks: t.remarks?.trim() || null,

// //           selectedAddon: t.selectedAddon
// //             ? { name: t.selectedAddon.name, price: Number(t.selectedAddon.price) || 0 }
// //             : null,
// //           selectedAddons: Array.isArray(t.selectedAddons)
// //             ? t.selectedAddons.map((a) => ({
// //                 trainIndex: a.trainIndex,
// //                 trainNo: a.trainNo,
// //                 trainName: a.trainName,
// //                 flightIndex: a.flightIndex,
// //                 flightNo: a.flightNo,
// //                 airline: a.airline,
// //                 tripType: a.tripType,
// //                 addonId: a.addonId,
// //                 name: a.name,
// //                 amount: Number(a.amount) || 0,
// //               }))
// //             : [],

// //           // Admin/Aadhaar-OCR tracking — carried through as-is.
// //           isCoTraveller: !!t.isCoTraveller,
// //           aadhaar: t._aadhaar || null,
// //         })),

// //         payment: {
// //           advance: { amount: amounts.advance },
// //           balance: { amount: amounts.balance },
// //         },

// //         paymentScreenshots,
// //       };

// //       const data = await adminAddBooking(payload);

// //       if (data.success) {
// //         navigate("/admin-bookings");
// //       }
// //     } catch (error) {
// //       console.error(error);
// //       toast.error("Booking failed. Please check traveller details.");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   // ── No tour picked yet (direct nav, Format 1 before selection) ──
// //   if (!tourId) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
// //         <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-10 max-w-lg w-full">
// //           <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
// //             Create Booking
// //           </h1>
// //           <label className="block text-base font-medium text-gray-800 mb-2">
// //             Select Tour *
// //           </label>
// //           <select
// //             value={tourId}
// //             onChange={(e) => setTourId(e.target.value)}
// //             className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
// //           >
// //             <option value="">-- Select a tour --</option>
// //             {tourList?.map((t) => (
// //               <option key={t._id} value={t._id}>
// //                 {t.title}
// //               </option>
// //             ))}
// //           </select>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (!tourInfo) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
// //         <p className="text-xl text-gray-600 animate-pulse">Loading tour details...</p>
// //       </div>
// //     );
// //   }

// //   const formatDate = (dateString) => {
// //     if (!dateString) return "Not specified";
// //     return new Date(dateString).toLocaleDateString("en-IN", {
// //       day: "numeric",
// //       month: "long",
// //       year: "numeric",
// //     });
// //   };

// //   return (
// //     <div
// //       className="
// //         w-full
// //         max-w-[98%] xs:max-w-[96%] sm:max-w-[98%] md:max-w-[96vw]
// //         lg:max-w-[94vw] xl:max-w-[92vw] 2xl:max-w-[90vw]
// //         rounded-3xl sm:rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[3.5rem] xl:rounded-[4rem]
// //         backdrop-blur-xl bg-white/40 border border-white/50
// //         shadow-2xl md:shadow-[0_30px_90px_-15px_rgba(0,0,0,0.12)]
// //         overflow-hidden
// //         p-8 xs:p-10 sm:p-12 md:p-16 lg:p-20 xl:p-24
// //       "
// //     >
// //       <div className="max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto">
// //         <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 md:mb-10 text-center transition-all duration-500 hover:shadow-xl">
// //           <div className="flex justify-between items-center mb-4">
// //             <button
// //               onClick={() => setTourId("")}
// //               className="text-sm text-indigo-600 hover:underline font-medium"
// //             >
// //               ← Change Tour
// //             </button>
// //           </div>

// //           <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
// //             {tourInfo.title}
// //           </h1>
// //           <p className="text-lg sm:text-xl text-gray-600 mb-4">
// //             {tourInfo.duration?.days} Days / {tourInfo.duration?.nights} Nights
// //           </p>

// //           <div className="mb-6">
// //             <p className="text-base sm:text-lg font-medium text-gray-700">
// //               Main Package Departure
// //             </p>
// //             <p className="text-lg sm:text-xl text-indigo-700 font-semibold">
// //               {formatDate(tourInfo.lastBookingDate)}
// //             </p>
// //           </div>

// //           {tourInfo.variantPackage && tourInfo.variantPackage.length > 0 && (
// //             <div className="mt-6 pt-6 border-t border-gray-200">
// //               <p className="text-base sm:text-lg font-medium text-gray-700 mb-4">
// //                 Variant Package Departures
// //               </p>
// //               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //                 {tourInfo.variantPackage.map((variant, i) => (
// //                   <div key={i} className="bg-indigo-50/70 rounded-xl p-4 text-left">
// //                     <p className="text-sm sm:text-base font-medium text-gray-800">
// //                       Variant {i + 1}
// //                     </p>
// //                     {variant.destination && (
// //                       <p className="text-sm text-gray-600 mt-1">
// //                         {variant.destination.join(", ")}
// //                       </p>
// //                     )}
// //                     <p className="text-base sm:text-lg text-indigo-700 font-semibold mt-2">
// //                       Departure: {formatDate(variant.lastBookingDate)}
// //                     </p>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           )}
// //         </div>

// //         {incoming.travellers?.length > 0 && (
// //           <div className="mb-8 px-6 py-4 bg-blue-50 border border-blue-300 rounded-2xl text-blue-900 shadow-md text-center font-medium">
// //             Pre-filled from Aadhaar Upload — verify and complete the remaining
// //             booking details below.
// //           </div>
// //         )}

// //         <div className="space-y-6 sm:space-y-8">
// //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
// //             <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl">
// //               <label className="block text-base sm:text-lg font-medium text-gray-800 mb-2 sm:mb-3">
// //                 Contact Email
// //               </label>
// //               <input
// //                 type="email"
// //                 className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none"
// //                 placeholder="your@email.com"
// //                 value={contact.email}
// //                 onChange={(e) =>
// //                   setContact((prev) => ({ ...prev, email: e.target.value }))
// //                 }
// //               />
// //             </div>
// //             <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl">
// //               <label className="block text-base sm:text-lg font-medium text-gray-800 mb-2 sm:mb-3">
// //                 Mobile Number
// //               </label>
// //               <input
// //                 type="tel"
// //                 className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none"
// //                 placeholder="Mobile number"
// //                 value={contact.mobile}
// //                 onChange={(e) =>
// //                   setContact((prev) => ({ ...prev, mobile: e.target.value }))
// //                 }
// //               />
// //             </div>
// //           </div>

// //           <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl">
// //             <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
// //               Billing Address (Optional)
// //             </h3>
// //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
// //               {[
// //                 ["addressLine1", "Address Line 1"],
// //                 ["addressLine2", "Address Line 2"],
// //                 ["city", "City"],
// //                 ["state", "State"],
// //                 ["pincode", "Pincode"],
// //                 ["country", "Country"],
// //               ].map(([field, placeholder]) => (
// //                 <input
// //                   key={field}
// //                   type="text"
// //                   placeholder={placeholder}
// //                   className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// //                   value={billingAddress[field]}
// //                   onChange={(e) =>
// //                     setBillingAddress((prev) => ({
// //                       ...prev,
// //                       [field]: e.target.value,
// //                     }))
// //                   }
// //                 />
// //               ))}
// //             </div>
// //           </div>

// //           {Object.keys(paymentScreenshots).length > 0 && (
// //             <div className="bg-green-50/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg border border-green-200">
// //               <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-3">
// //                 Payment Screenshots (from Aadhaar Upload)
// //               </h3>
// //               <div className="flex flex-wrap gap-3 text-sm text-green-800">
// //                 {Object.entries(paymentScreenshots).map(([slot, data]) => (
// //                   <span
// //                     key={slot}
// //                     className="px-3 py-1.5 bg-white rounded-lg border border-green-200 capitalize"
// //                   >
// //                     {slot}
// //                     {data.amount ? ` — ${currencySymbol}${data.amount}` : ""} ✓
// //                   </span>
// //                 ))}
// //               </div>
// //             </div>
// //           )}

// //           <div>
// //             <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
// //               Traveller Details
// //             </h2>

// //             {travellers.map((traveller, index) => {
// //               const selectedPackage =
// //                 traveller.packageType === "main"
// //                   ? tourInfo
// //                   : tourInfo.variantPackage?.[traveller.variantPackageIndex];

// //               const trainDetails = selectedPackage?.trainDetails || [];
// //               const flightDetailsAll = selectedPackage?.flightDetails || [];

// //               const flightsWithAddons = flightDetailsAll
// //                 .map((flight, flightIndexInPackage) => ({ flight, flightIndexInPackage }))
// //                 .filter(
// //                   ({ flight }) =>
// //                     Array.isArray(flight.addons) && flight.addons.length > 0,
// //                 );

// //               const trainAddonsExist = trainDetails.some(
// //                 (t) => Array.isArray(t.addons) && t.addons.length > 0,
// //               );
// //               const flightAddonsExist = flightsWithAddons.length > 0;
// //               const hasLegAddons = trainAddonsExist || flightAddonsExist;
// //               const flatAddons = selectedPackage?.addons || [];

// //               return (
// //                 <div
// //                   key={index}
// //                   className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 sm:p-8 mb-4 sm:mb-6 transition-all duration-500 hover:shadow-xl border border-indigo-100"
// //                 >
// //                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
// //                     <h3 className="text-lg sm:text-xl font-semibold text-indigo-800 flex items-center gap-2">
// //                       Traveller {index + 1}
// //                       {traveller.isCoTraveller && (
// //                         <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
// //                           Aadhaar OCR
// //                         </span>
// //                       )}
// //                     </h3>
// //                     {travellers.length > 1 && (
// //                       <button
// //                         onClick={() => removeTraveller(index)}
// //                         className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
// //                       >
// //                         Remove Traveller
// //                       </button>
// //                     )}
// //                   </div>

// //                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mb-4 sm:mb-6">
// //                     <select
// //                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// //                       value={
// //                         traveller.packageType === "main"
// //                           ? "main"
// //                           : traveller.variantPackageIndex
// //                       }
// //                       onChange={(e) => {
// //                         const value = e.target.value;
// //                         if (value === "main") {
// //                           handleTravellerChange(index, "packageType", "main");
// //                           handleTravellerChange(index, "variantPackageIndex", null);
// //                         } else {
// //                           handleTravellerChange(index, "packageType", "variant");
// //                           handleTravellerChange(index, "variantPackageIndex", Number(value));
// //                         }
// //                       }}
// //                     >
// //                       <option value="main">Main Package</option>
// //                       {tourInfo.variantPackage?.map((pkg, i) => (
// //                         <option key={i} value={i}>
// //                           Variant {i + 1} ({pkg.destination?.join(", ")})
// //                         </option>
// //                       ))}
// //                     </select>

// //                     <select
// //                       value={traveller.title}
// //                       onChange={(e) => handleTravellerChange(index, "title", e.target.value)}
// //                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// //                     >
// //                       <option>Mr</option>
// //                       <option>Mrs</option>
// //                       <option>Ms</option>
// //                     </select>

// //                     <input
// //                       type="text"
// //                       placeholder="First Name (As per Aadhar)"
// //                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// //                       value={traveller.firstName}
// //                       onChange={(e) => handleTravellerChange(index, "firstName", e.target.value)}
// //                     />

// //                     <input
// //                       type="text"
// //                       placeholder="Last Name (As per Aadhar)"
// //                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// //                       value={traveller.lastName}
// //                       onChange={(e) => handleTravellerChange(index, "lastName", e.target.value)}
// //                     />

// //                     <input
// //                       type="number"
// //                       placeholder="Age"
// //                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// //                       value={traveller.age}
// //                       onChange={(e) => handleTravellerChange(index, "age", e.target.value)}
// //                     />

// //                     <select
// //                       value={traveller.gender}
// //                       onChange={(e) => handleTravellerChange(index, "gender", e.target.value)}
// //                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// //                     >
// //                       <option value="">Gender</option>
// //                       <option>Male</option>
// //                       <option>Female</option>
// //                       <option>Other</option>
// //                     </select>
// //                   </div>

// //                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-6">
// //                     <div>
// //                       <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
// //                         Boarding Point
// //                       </label>
// //                       <select
// //                         className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// //                         value={getPointId(traveller.boardingPoint)}
// //                         onChange={(e) => {
// //                           const pkg =
// //                             traveller.packageType === "main"
// //                               ? tourInfo
// //                               : tourInfo.variantPackage?.[traveller.variantPackageIndex];
// //                           const selectedBP = pkg?.boardingPoints?.find(
// //                             (bp) => getPointId(bp) === e.target.value,
// //                           );
// //                           handleTravellerChange(index, "boardingPoint", selectedBP || null);
// //                         }}
// //                       >
// //                         <option value="">Select Boarding Point</option>
// //                         {(traveller.packageType === "main"
// //                           ? tourInfo.boardingPoints
// //                           : tourInfo.variantPackage?.[traveller.variantPackageIndex]
// //                               ?.boardingPoints || []
// //                         )?.map((bp, i) => (
// //                           <option key={getPointId(bp) || i} value={getPointId(bp)}>
// //                             {bp.stationCode} - {bp.stationName}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     </div>

// //                     <div>
// //                       <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
// //                         Deboarding Point
// //                       </label>
// //                       <select
// //                         className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// //                         value={getPointId(traveller.deboardingPoint)}
// //                         onChange={(e) => {
// //                           const pkg =
// //                             traveller.packageType === "main"
// //                               ? tourInfo
// //                               : tourInfo.variantPackage?.[traveller.variantPackageIndex];
// //                           const selectedDP = pkg?.deboardingPoints?.find(
// //                             (dp) => getPointId(dp) === e.target.value,
// //                           );
// //                           handleTravellerChange(index, "deboardingPoint", selectedDP || null);
// //                         }}
// //                       >
// //                         <option value="">Select Deboarding Point</option>
// //                         {(traveller.packageType === "main"
// //                           ? tourInfo.deboardingPoints
// //                           : tourInfo.variantPackage?.[traveller.variantPackageIndex]
// //                               ?.deboardingPoints || []
// //                         )?.map((dp, i) => (
// //                           <option key={getPointId(dp) || i} value={getPointId(dp)}>
// //                             {dp.stationCode} - {dp.stationName}
// //                           </option>
// //                         ))}
// //                       </select>
// //                     </div>
// //                   </div>

// //                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-6">
// //                     <div>
// //                       <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
// //                         Sharing Type
// //                       </label>
// //                       <select
// //                         value={traveller.sharingType}
// //                         onChange={(e) => handleTravellerChange(index, "sharingType", e.target.value)}
// //                         className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// //                       >
// //                         <option value="">Select Sharing</option>
// //                         {Number(traveller.age) >= 11 ? (
// //                           <>
// //                             <option value="double">Double Sharing</option>
// //                             <option value="triple">Triple Sharing</option>
// //                           </>
// //                         ) : Number(traveller.age) >= 6 && Number(traveller.age) <= 10 ? (
// //                           <>
// //                             <option value="withBerth">Child with Berth</option>
// //                             <option value="withoutBerth">Child without Berth</option>
// //                           </>
// //                         ) : null}
// //                       </select>
// //                     </div>

// //                     {!hasLegAddons && flatAddons.length > 0 && (
// //                       <div>
// //                         <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
// //                           Add-ons (Optional)
// //                         </label>
// //                         <select
// //                           className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
// //                           value={getSelectedFlatAddonId(traveller, flatAddons)}
// //                           onChange={(e) => handleFlatAddonSelect(index, e.target.value, flatAddons)}
// //                         >
// //                           <option value="">No Add-on</option>
// //                           {flatAddons.map((addon) => (
// //                             <option key={addon._id || addon.id} value={addon._id || addon.id}>
// //                               {addon.name} (+{currencySymbol}{addon.amount || 0})
// //                             </option>
// //                           ))}
// //                         </select>
// //                       </div>
// //                     )}
// //                   </div>

// //                   {hasLegAddons && (
// //                     <>
// //                       <div className="mt-6 pt-6 border-t border-gray-200">
// //                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
// //                           <div>
// //                             <div className="flex items-center gap-2">
// //                               <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-lg">
// //                                 🚆
// //                               </div>
// //                               <h3 className="text-lg sm:text-xl font-bold text-gray-800">
// //                                 TRAIN WISE ADD-ONS
// //                               </h3>
// //                             </div>
// //                             <p className="text-sm text-gray-500 mt-1">
// //                               Select add-ons for each trip
// //                             </p>
// //                           </div>
// //                           <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
// //                             <span className="text-sm font-semibold text-gray-600">TOTAL ADD ONS:</span>
// //                             <span className="ml-2 text-base font-bold text-indigo-700">
// //                               {currencySymbol}
// //                               {(traveller.selectedAddons || []).reduce(
// //                                 (total, addon) => total + (Number(addon.amount) || 0),
// //                                 0,
// //                               )}
// //                             </span>
// //                           </div>
// //                         </div>

// //                         {trainDetails.length > 0 ? (
// //                           <div className="space-y-3">
// //                             {trainDetails.map((train, trainIndex) => {
// //                               const trainAddons = train.addons || [];
// //                               return (
// //                                 <div
// //                                   key={train._id || trainIndex}
// //                                   className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white hover:border-indigo-200 transition-all"
// //                                 >
// //                                   <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_300px] gap-4 items-center">
// //                                     <div className="flex md:justify-center">
// //                                       <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
// //                                         {String(trainIndex + 1).padStart(2, "0")}
// //                                       </div>
// //                                     </div>
// //                                     <div>
// //                                       {train.tripType && (
// //                                         <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase">
// //                                           {train.tripType}
// //                                         </span>
// //                                       )}
// //                                       <h4 className="text-base sm:text-lg font-semibold text-gray-800">
// //                                         {train.trainName}{" "}
// //                                         <span className="text-gray-500 font-medium">({train.trainNo})</span>
// //                                       </h4>
// //                                       <p className="text-sm text-gray-500 mt-1">
// //                                         {train.fromStation}
// //                                         <span className="mx-2 text-gray-400">→</span>
// //                                         {train.toStation}
// //                                       </p>
// //                                     </div>
// //                                     <div>
// //                                       <label className="block text-sm font-medium text-gray-700 mb-1.5">
// //                                         Add-on
// //                                       </label>
// //                                       <select
// //                                         className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
// //                                         value={getSelectedAddonForTrain(traveller, trainIndex)}
// //                                         onChange={(e) => handleAddonChange(index, trainIndex, e.target.value)}
// //                                       >
// //                                         <option value="">No Add-on</option>
// //                                         {trainAddons.map((addon) => (
// //                                           <option key={addon._id || addon.id} value={addon._id || addon.id}>
// //                                             {addon.name} ({currencySymbol}{addon.amount || 0})
// //                                           </option>
// //                                         ))}
// //                                       </select>
// //                                     </div>
// //                                   </div>
// //                                 </div>
// //                               );
// //                             })}
// //                           </div>
// //                         ) : (
// //                           <div className="border border-dashed border-gray-300 rounded-xl p-5 text-center">
// //                             <p className="text-sm text-gray-500">No train / trip details available.</p>
// //                           </div>
// //                         )}
// //                       </div>

// //                       {flightsWithAddons.length > 0 && (
// //                         <div className="mt-6 pt-6 border-t border-gray-200">
// //                           <div className="flex items-center gap-2 mb-4">
// //                             <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 text-lg">
// //                               ✈️
// //                             </div>
// //                             <h3 className="text-lg sm:text-xl font-bold text-gray-800">
// //                               FLIGHT WISE ADD-ONS
// //                             </h3>
// //                           </div>
// //                           <div className="space-y-3">
// //                             {flightsWithAddons.map(({ flight, flightIndexInPackage }) => (
// //                               <div
// //                                 key={flight._id || flightIndexInPackage}
// //                                 className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white hover:border-purple-200 transition-all"
// //                               >
// //                                 <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_300px] gap-4 items-center">
// //                                   <div className="flex md:justify-center">
// //                                     <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
// //                                       {String(flightIndexInPackage + 1).padStart(2, "0")}
// //                                     </div>
// //                                   </div>
// //                                   <div>
// //                                     {flight.tripType && (
// //                                       <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold uppercase">
// //                                         {flight.tripType}
// //                                       </span>
// //                                     )}
// //                                     <h4 className="text-base sm:text-lg font-semibold text-gray-800">
// //                                       {flight.airline}{" "}
// //                                       <span className="text-gray-500 font-medium">({flight.flightNo})</span>
// //                                     </h4>
// //                                     <p className="text-sm text-gray-500 mt-1">
// //                                       {flight.fromAirport}
// //                                       <span className="mx-2 text-gray-400">→</span>
// //                                       {flight.toAirport}
// //                                     </p>
// //                                   </div>
// //                                   <div>
// //                                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
// //                                       Add-on
// //                                     </label>
// //                                     <select
// //                                       className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all"
// //                                       value={getSelectedAddonForFlight(traveller, flightIndexInPackage)}
// //                                       onChange={(e) =>
// //                                         handleFlightAddonChange(index, flightIndexInPackage, e.target.value)
// //                                       }
// //                                     >
// //                                       <option value="">No Add-on</option>
// //                                       {(flight.addons || []).map((addon) => (
// //                                         <option key={addon._id || addon.id} value={addon._id || addon.id}>
// //                                           {addon.name} ({currencySymbol}{addon.amount || 0})
// //                                         </option>
// //                                       ))}
// //                                     </select>
// //                                   </div>
// //                                 </div>
// //                               </div>
// //                             ))}
// //                           </div>
// //                         </div>
// //                       )}
// //                     </>
// //                   )}

// //                   <textarea
// //                     className="w-full mt-6 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 resize-none"
// //                     rows="3"
// //                     placeholder="Remarks (optional)"
// //                     value={traveller.remarks}
// //                     onChange={(e) => handleTravellerChange(index, "remarks", e.target.value)}
// //                   />
// //                 </div>
// //               );
// //             })}

// //             <button
// //               onClick={addTraveller}
// //               className="bg-indigo-100 text-indigo-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:bg-indigo-200 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto"
// //             >
// //               + Add Another Traveller
// //             </button>
// //           </div>

// //           <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
// //             <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
// //               Booking Summary
// //             </h3>
// //             <div className="space-y-3 sm:space-y-5 text-base sm:text-lg text-gray-700">
// //               <div className="flex justify-between">
// //                 <span>Advance Amount:</span>
// //                 <strong className="text-indigo-700">{currencySymbol}{amounts.advance}/-</strong>
// //               </div>
// //               <div className="flex justify-between">
// //                 <span>Balance Amount:</span>
// //                 <strong className="text-indigo-700">{currencySymbol}{amounts.balance}/-</strong>
// //               </div>
// //               <div className="flex justify-between">
// //                 <span>Add-ons Total:</span>
// //                 <strong className="text-indigo-700">{currencySymbol}{amounts.addonsTotal}/-</strong>
// //               </div>
// //               <hr className="border-gray-200" />
// //               <div className="flex justify-between text-xl sm:text-2xl font-bold text-gray-800 pt-2 sm:pt-3">
// //                 <span>Total Payable:</span>
// //                 <span className="text-indigo-800">{currencySymbol}{amounts.advance + amounts.balance}/-</span>
// //               </div>
// //             </div>
// //           </div>

// //           <button
// //             onClick={handleAddToTrolly}
// //             disabled={isSubmitting}
// //             className={`w-full py-4 sm:py-5 rounded-2xl text-white font-bold text-lg sm:text-xl transition-all duration-500 transform hover:scale-[1.02] shadow-xl ${
// //               isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
// //             } ${isSubmitting ? "" : "hover:shadow-2xl"}`}
// //           >
// //             {isSubmitting ? (
// //               <span className="flex items-center justify-center gap-3">
// //                 <svg className="animate-spin h-5 sm:h-6 w-5 sm:w-6" viewBox="0 0 24 24">
// //                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
// //                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
// //                 </svg>
// //                 Adding to Trolly...
// //               </span>
// //             ) : (
// //               "Add to Trolly"
// //             )}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CreateBooking;

// import React, { useContext, useEffect, useState, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { TourContext } from "../../context/TourContext";
// import { toast } from "react-toastify";

// // stationCode is NOT guaranteed unique within a tour's boardingPoints /
// // deboardingPoints array (same mirrors the customer-facing TourBooking.jsx
// // fix) — select/match by each point's own _id instead.
// const getPointId = (point) => {
//   if (!point) return "";
//   const raw = point._id;
//   if (raw && typeof raw === "object" && raw.$oid) return String(raw.$oid);
//   return raw !== undefined && raw !== null ? String(raw) : "";
// };

// // Blank traveller — same shape as the customer-facing booking form, plus
// // two admin-only fields: isCoTraveller/aadhaar (hidden, not rendered,
// // forwarded as-is to the backend) that track whether this traveller came
// // through Aadhaar OCR on the Aadhaar Upload page.
// const blankTraveller = () => ({
//   title: "Mr",
//   firstName: "",
//   lastName: "",
//   age: "",
//   gender: "Male",
//   sharingType: "",
//   selectedAddon: null,
//   selectedAddons: [],
//   boardingPoint: null,
//   deboardingPoint: null,
//   remarks: "",
//   packageType: "main",
//   variantPackageIndex: null,
//   isCoTraveller: false,
//   _aadhaar: null, // { front, back } once OCR'd — never rendered, just carried through
// });

// // Merge an OCR-prefilled traveller (from AadhaarUpload: title/firstName/
// // lastName/age/gender/isCoTraveller/_aadhaar only) onto the full blank
// // shape so every booking-specific field the admin still has to fill
// // (package, sharing, boarding/deboarding, addons, remarks) is present.
// const hydrateTraveller = (partial) => ({
//   ...blankTraveller(),
//   ...partial,
// });

// const CreateBooking = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const {
//     tourList,
//     getTourList,
//     currencySymbol,
//     adminAddBooking,
//     linkGroupTnr,
//   } = useContext(TourContext);

//   // ── Format 1: direct nav (no state) → manual booking, admin picks the
//   // tour from the dropdown below.
//   // ── Format 2: nav'd from AadhaarUpload with { tourId, travellers,
//   // paymentScreenshots, contactMobile, contactAddress, groupId } in state →
//   // everything pre-filled. contactMobile/contactAddress/groupId were always
//   // being sent here but never read — contact.mobile and billingAddress
//   // stayed blank below regardless, and groupId (which would let this page
//   // link the real tnr straight back to that Aadhaar Upload group) was
//   // dropped on the floor entirely.
//   const incoming = location.state || {};

//   const [tourId, setTourId] = useState(incoming.tourId || "");
//   const [tourInfo, setTourInfo] = useState(null);
//   const [bookingType] = useState("offline"); // admin walk-ins are always offline/in-person
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [travellers, setTravellers] = useState(
//     incoming.travellers?.length > 0
//       ? incoming.travellers.map(hydrateTraveller)
//       : [blankTraveller()],
//   );

//   const [paymentScreenshots] = useState(incoming.paymentScreenshots || {});

//   const [amounts, setAmounts] = useState({
//     advance: 0,
//     balance: 0,
//     addonsTotal: 0,
//   });

//   // Prefilled from AadhaarUpload's nav state when present (Format 2) —
//   // the admin no longer has to retype the phone number/address that were
//   // already captured during Aadhaar Upload.
//   const [contact, setContact] = useState({
//     email: "",
//     mobile: incoming.contactMobile || "",
//   });

//   const [billingAddress, setBillingAddress] = useState({
//     addressLine1: incoming.contactAddress || "",
//     addressLine2: "",
//     city: "",
//     state: "",
//     pincode: "",
//     country: "India",
//   });

//   useEffect(() => {
//     if (!tourList || tourList.length === 0) getTourList();
//   }, [tourList, getTourList]);

//   useEffect(() => {
//     if (!tourId || !tourList?.length) {
//       setTourInfo(null);
//       return;
//     }
//     const t = tourList.find((tour) => tour._id === tourId);
//     setTourInfo(t || null);
//   }, [tourId, tourList]);

//   // Auto-fill boarding/deboarding point AND train/flight add-ons from the
//   // Aadhaar Upload capture. bookingNotes stores these as plain text (see
//   // AadhaarUpload.jsx's handleSaveBooking): boardingPoint/deboardingPoint
//   // as "STATIONCODE - Station Name", and addonsDetail as
//   // [{ label: "HAMSAFER (23456) - BOARDING", name: "3AC Extra", amount }]
//   // — none of it carries the real _ids the dropdowns below need, so it has
//   // to be matched back onto this tour's actual boardingPoints/
//   // deboardingPoints/trainDetails/flightDetails.
//   //
//   // Everything is computed and applied in ONE setTravellers call (rather
//   // than several handleTravellerChange/handleAddonChange calls) because
//   // those all read the same stale `travellers` closure from this effect —
//   // calling them one after another would make each call overwrite the
//   // previous one's change instead of combining.
//   //
//   // Unmatched add-on notes (train/addon renamed or removed from the tour
//   // since Aadhaar Upload, say) are kept in `unmatchedAddonNotes` so they
//   // still show as a reminder banner instead of silently vanishing.
//   const bookingNotesAppliedRef = useRef(false);
//   const [unmatchedAddonNotes, setUnmatchedAddonNotes] = useState([]);
//   useEffect(() => {
//     if (!tourInfo || bookingNotesAppliedRef.current) return;
//     const notes = incoming.bookingNotes;
//     if (!notes) return;
//     bookingNotesAppliedRef.current = true;

//     setTravellers((prev) => {
//       const updated = prev.map((t) => ({
//         ...t,
//         selectedAddons: Array.isArray(t.selectedAddons) ? [...t.selectedAddons] : [],
//       }));
//       const mainTraveller = updated[0];
//       if (!mainTraveller) return prev;

//       const pkg =
//         mainTraveller.packageType === "variant"
//           ? tourInfo.variantPackage?.[mainTraveller.variantPackageIndex]
//           : tourInfo;
//       if (!pkg) return prev;

//       const matchPoint = (str, list) => {
//         if (!str) return null;
//         const code = str.split(" - ")[0]?.trim().toUpperCase();
//         if (!code) return null;
//         return (
//           (list || []).find(
//             (p) => (p.stationCode || "").trim().toUpperCase() === code,
//           ) || null
//         );
//       };

//       const bp = matchPoint(notes.boardingPoint, pkg.boardingPoints);
//       const dp = matchPoint(notes.deboardingPoint, pkg.deboardingPoints);

//       const matchedAddons = [];
//       const unmatched = [];
//       (notes.addonsDetail || []).forEach((detail) => {
//         if (!detail?.name || !detail?.label) {
//           if (detail?.name) unmatched.push(detail);
//           return;
//         }
//         const numMatch = detail.label.match(/\(([^)]+)\)/);
//         const num = numMatch?.[1]?.trim();
//         const legPart = detail.label.split(" - ")[1]?.trim().toUpperCase();
//         const addonName = detail.name.trim().toLowerCase();

//         const trainIndex = (pkg.trainDetails || []).findIndex((t) => {
//           const noOk = num && String(t.trainNo || "").trim() === num;
//           const legOk =
//             !legPart || String(t.tripType || "").trim().toUpperCase() === legPart;
//           return noOk && legOk;
//         });
//         if (trainIndex !== -1) {
//           const train = pkg.trainDetails[trainIndex];
//           const addon = (train.addons || []).find(
//             (a) => (a.name || "").trim().toLowerCase() === addonName,
//           );
//           if (addon) {
//             matchedAddons.push({
//               trainIndex,
//               trainNo: train.trainNo,
//               trainName: train.trainName,
//               tripType: train.tripType,
//               addonId: addon._id || addon.id,
//               name: addon.name,
//               amount: Number(addon.amount) || 0,
//               addedAt: new Date(),
//             });
//             return;
//           }
//         }

//         const flightIndex = (pkg.flightDetails || []).findIndex((f) => {
//           const noOk = num && String(f.flightNo || "").trim() === num;
//           const legOk =
//             !legPart || String(f.tripType || "").trim().toUpperCase() === legPart;
//           return noOk && legOk;
//         });
//         if (flightIndex !== -1) {
//           const flight = pkg.flightDetails[flightIndex];
//           const addon = (flight.addons || []).find(
//             (a) => (a.name || "").trim().toLowerCase() === addonName,
//           );
//           if (addon) {
//             matchedAddons.push({
//               flightIndex,
//               flightNo: flight.flightNo,
//               airline: flight.airline,
//               tripType: flight.tripType,
//               addonId: addon._id || addon.id,
//               name: addon.name,
//               amount: Number(addon.amount) || 0,
//               addedAt: new Date(),
//             });
//             return;
//           }
//         }

//         unmatched.push(detail);
//       });

//       updated.forEach((t) => {
//         const samePackage =
//           t.packageType === mainTraveller.packageType &&
//           (t.packageType !== "variant" ||
//             t.variantPackageIndex === mainTraveller.variantPackageIndex);
//         if (!samePackage) return;
//         if (bp) t.boardingPoint = bp;
//         if (dp) t.deboardingPoint = dp;
//         if (matchedAddons.length) {
//           let sa = Array.isArray(t.selectedAddons) ? [...t.selectedAddons] : [];
//           matchedAddons.forEach((ma) => {
//             sa = sa.filter(
//               (a) =>
//                 (ma.trainIndex === undefined || a.trainIndex !== ma.trainIndex) &&
//                 (ma.flightIndex === undefined || a.flightIndex !== ma.flightIndex),
//             );
//           });
//           t.selectedAddons = [...sa, ...matchedAddons];
//         }
//       });

//       setUnmatchedAddonNotes(unmatched);
//       return updated;
//     });
//   }, [tourInfo]);

//   useEffect(() => {
//     if (!tourInfo) return;

//     let totalAdvance = 0;
//     let totalBalance = 0;
//     let totalAddons = 0;

//     travellers.forEach((t) => {
//       const age = Number(t.age);
//       let travellerAdvance = 0;
//       let travellerBalance = 0;

//       const selectedPackage =
//         t.packageType === "main"
//           ? tourInfo
//           : tourInfo.variantPackage?.[t.variantPackageIndex];

//       if (!selectedPackage) return;

//       if (age >= 11) {
//         travellerAdvance = Number(selectedPackage.advanceAmount?.adult) || 0;
//         if (t.sharingType === "double") {
//           travellerBalance = Number(selectedPackage.balanceDouble) || 0;
//         } else if (t.sharingType === "triple") {
//           travellerBalance = Number(selectedPackage.balanceTriple) || 0;
//         }
//       } else if (age >= 6 && age <= 10) {
//         travellerAdvance = Number(selectedPackage.advanceAmount?.child) || 0;
//         if (t.sharingType === "withBerth") {
//           travellerBalance = Number(selectedPackage.balanceChildWithBerth) || 0;
//         } else if (t.sharingType === "withoutBerth") {
//           travellerBalance =
//             Number(selectedPackage.balanceChildWithoutBerth) || 0;
//         }
//       }

//       const travellerAddons = Array.isArray(t.selectedAddons)
//         ? t.selectedAddons
//         : [];
//       travellerAddons.forEach((addon) => {
//         const addonPrice = Number(addon.amount) || 0;
//         totalAddons += addonPrice;
//         travellerAdvance += addonPrice;
//       });

//       const flatAddonPrice = Number(t.selectedAddon?.price) || 0;
//       totalAddons += flatAddonPrice;
//       travellerAdvance += flatAddonPrice;

//       totalAdvance += travellerAdvance;
//       totalBalance += travellerBalance;
//     });

//     setAmounts({
//       advance: totalAdvance,
//       balance: totalBalance,
//       addonsTotal: totalAddons,
//     });
//   }, [travellers, tourInfo]);

//   const handleTravellerChange = (index, field, value) => {
//     const updated = [...travellers];

//     if (field === "title") {
//       if (value === "Mr") updated[index].gender = "Male";
//       else if (value === "Mrs" || value === "Ms") updated[index].gender = "Female";
//     }
//     if (field === "gender") {
//       if (value === "Male") updated[index].title = "Mr";
//       else if (value === "Female") updated[index].title = "Ms";
//     }
//     if (field === "age") {
//       const age = Number(value);
//       if (age > 85) {
//         toast.error("Age cannot exceed 85 years.");
//         return;
//       }
//       if (age >= 11) updated[index].sharingType = "double";
//       else if (age >= 6 && age <= 10) updated[index].sharingType = "withBerth";
//       else updated[index].sharingType = "";
//     }

//     updated[index][field] = value;

//     if (field === "packageType" || field === "variantPackageIndex") {
//       updated[index].boardingPoint = null;
//       updated[index].deboardingPoint = null;
//       updated[index].selectedAddon = null;
//       updated[index].selectedAddons = [];
//     }

//     // Booking details (boarding/deboarding point) are the same trip for
//     // every traveller in one booking — setting it on any one traveller
//     // sets it on every traveller sharing the same package, instead of
//     // the admin having to repeat it per traveller.
//     if (field === "boardingPoint" || field === "deboardingPoint") {
//       const changed = updated[index];
//       updated.forEach((t, i) => {
//         if (i === index) return;
//         const samePackage =
//           t.packageType === changed.packageType &&
//           (t.packageType !== "variant" ||
//             t.variantPackageIndex === changed.variantPackageIndex);
//         if (samePackage) {
//           t[field] = value;
//         }
//       });
//     }

//     setTravellers(updated);
//   };

//   const addTraveller = () => setTravellers([...travellers, blankTraveller()]);

//   const removeTraveller = (index) =>
//     setTravellers(travellers.filter((_, i) => i !== index));

//   const handleAddonChange = (travellerIndex, trainIndex, addonId) => {
//     const updated = [...travellers];
//     const traveller = updated[travellerIndex];
//     const selectedPackage =
//       traveller.packageType === "main"
//         ? tourInfo
//         : tourInfo.variantPackage?.[traveller.variantPackageIndex];
//     const train = selectedPackage?.trainDetails?.[trainIndex];
//     if (!train) return;

//     const selectedAddon = addonId
//       ? train.addons?.find((a) => String(a._id || a.id) === String(addonId))
//       : null;

//     const applyTo = (t) => {
//       let selectedAddons = Array.isArray(t.selectedAddons)
//         ? [...t.selectedAddons]
//         : [];
//       selectedAddons = selectedAddons.filter((a) => a.trainIndex !== trainIndex);
//       if (addonId && selectedAddon) {
//         selectedAddons.push({
//           trainIndex,
//           trainNo: train.trainNo,
//           trainName: train.trainName,
//           tripType: train.tripType,
//           addonId: selectedAddon._id || selectedAddon.id,
//           name: selectedAddon.name,
//           amount: Number(selectedAddon.amount) || 0,
//           addedAt: new Date(),
//         });
//       }
//       t.selectedAddons = selectedAddons;
//     };

//     // Same "booking details are shared across the group" rule as the
//     // boarding/deboarding point: a train add-on picked for one traveller
//     // applies to every traveller riding the same package, not just the
//     // one the dropdown was touched on.
//     updated.forEach((t) => {
//       const samePackage =
//         t.packageType === traveller.packageType &&
//         (t.packageType !== "variant" ||
//           t.variantPackageIndex === traveller.variantPackageIndex);
//       if (samePackage) applyTo(t);
//     });

//     setTravellers(updated);
//   };

//   const handleFlightAddonChange = (travellerIndex, flightIndex, addonId) => {
//     const updated = [...travellers];
//     const traveller = updated[travellerIndex];
//     const selectedPackage =
//       traveller.packageType === "main"
//         ? tourInfo
//         : tourInfo.variantPackage?.[traveller.variantPackageIndex];
//     const flight = selectedPackage?.flightDetails?.[flightIndex];
//     if (!flight) return;

//     const selectedAddon = addonId
//       ? flight.addons?.find((a) => String(a._id || a.id) === String(addonId))
//       : null;

//     const applyTo = (t) => {
//       let selectedAddons = Array.isArray(t.selectedAddons)
//         ? [...t.selectedAddons]
//         : [];
//       selectedAddons = selectedAddons.filter((a) => a.flightIndex !== flightIndex);
//       if (addonId && selectedAddon) {
//         selectedAddons.push({
//           flightIndex,
//           flightNo: flight.flightNo,
//           airline: flight.airline,
//           tripType: flight.tripType,
//           addonId: selectedAddon._id || selectedAddon.id,
//           name: selectedAddon.name,
//           amount: Number(selectedAddon.amount) || 0,
//           addedAt: new Date(),
//         });
//       }
//       t.selectedAddons = selectedAddons;
//     };

//     // Same sharing rule as the train add-on handler above — a flight
//     // add-on picked for one traveller applies to the whole group on
//     // this package.
//     updated.forEach((t) => {
//       const samePackage =
//         t.packageType === traveller.packageType &&
//         (t.packageType !== "variant" ||
//           t.variantPackageIndex === traveller.variantPackageIndex);
//       if (samePackage) applyTo(t);
//     });

//     setTravellers(updated);
//   };

//   const handleFlatAddonSelect = (travellerIndex, addonId, flatAddonsList) => {
//     const updated = [...travellers];
//     const traveller = updated[travellerIndex];
//     const selected = addonId
//       ? flatAddonsList.find((a) => String(a._id || a.id) === String(addonId))
//       : null;
//     const value = selected
//       ? { name: selected.name, price: Number(selected.amount) || 0 }
//       : null;

//     // Same sharing rule as the other add-on handlers — applies to every
//     // traveller on the same package.
//     updated.forEach((t) => {
//       const samePackage =
//         t.packageType === traveller.packageType &&
//         (t.packageType !== "variant" ||
//           t.variantPackageIndex === traveller.variantPackageIndex);
//       if (samePackage) t.selectedAddon = value;
//     });

//     setTravellers(updated);
//   };

//   const getSelectedFlatAddonId = (traveller, flatAddonsList) => {
//     const flat = traveller?.selectedAddon;
//     if (!flat?.name) return "";
//     const match = (flatAddonsList || []).find((a) => a.name === flat.name);
//     return match ? String(match._id || match.id) : "";
//   };

//   const getSelectedAddonForTrain = (traveller, trainIndex) => {
//     const selectedAddons = Array.isArray(traveller.selectedAddons)
//       ? traveller.selectedAddons
//       : [];
//     return (
//       selectedAddons.find((a) => a.trainIndex === trainIndex)?.addonId || ""
//     );
//   };

//   const getSelectedAddonForFlight = (traveller, flightIndex) => {
//     const selectedAddons = Array.isArray(traveller.selectedAddons)
//       ? traveller.selectedAddons
//       : [];
//     return (
//       selectedAddons.find((a) => a.flightIndex === flightIndex)?.addonId || ""
//     );
//   };

//   const handleAddToTrolly = async () => {
//     if (!tourId) {
//       toast.error("Select a tour first");
//       return;
//     }

//     setIsSubmitting(true);

//     for (let [idx, t] of travellers.entries()) {
//       const age = Number(t.age);

//       if (!t.firstName?.trim()) {
//         toast.error(`Traveller ${idx + 1}: First Name is required (As per Aadhar).`);
//         setIsSubmitting(false);
//         return;
//       }
//       if (!t.lastName?.trim()) {
//         toast.error(`Traveller ${idx + 1}: Last Name is required (As per Aadhar).`);
//         setIsSubmitting(false);
//         return;
//       }
//       if (isNaN(age) || age < 1) {
//         toast.error(`Invalid age for traveller: ${t.firstName || "Unnamed"}.`);
//         setIsSubmitting(false);
//         return;
//       }
//       if (!t.gender) {
//         toast.error("Please select gender for all travellers.");
//         setIsSubmitting(false);
//         return;
//       }
//       if (!t.sharingType) {
//         toast.error("Please select a sharing type for all travellers.");
//         setIsSubmitting(false);
//         return;
//       }
//       if (!t.boardingPoint) {
//         toast.error("Please select a boarding point for all travellers.");
//         setIsSubmitting(false);
//         return;
//       }
//       if (!t.deboardingPoint) {
//         toast.error("Please select a deboarding point for all travellers.");
//         setIsSubmitting(false);
//         return;
//       }
//       if (t.packageType === "variant" && t.variantPackageIndex === null) {
//         toast.error(`Please select a variant package for traveller: ${t.firstName}.`);
//         setIsSubmitting(false);
//         return;
//       }
//     }

//     const billingData =
//       billingAddress.addressLine1.trim() ||
//       billingAddress.city.trim() ||
//       billingAddress.state.trim() ||
//       billingAddress.pincode.trim()
//         ? billingAddress
//         : null;

//     try {
//       const payload = {
//         tourId,
//         bookingType,
//         contact,
//         billingAddress: billingData,

//         travellers: travellers.map((t) => ({
//           title: t.title,
//           firstName: t.firstName?.trim(),
//           lastName: t.lastName?.trim(),
//           age: Number(t.age),
//           gender: t.gender,
//           packageType: t.packageType,
//           variantPackageIndex:
//             t.packageType === "variant" ? t.variantPackageIndex : null,
//           sharingType: t.sharingType,
//           boardingPoint: t.boardingPoint,
//           deboardingPoint: t.deboardingPoint,
//           remarks: t.remarks?.trim() || null,

//           selectedAddon: t.selectedAddon
//             ? { name: t.selectedAddon.name, price: Number(t.selectedAddon.price) || 0 }
//             : null,
//           selectedAddons: Array.isArray(t.selectedAddons)
//             ? t.selectedAddons.map((a) => ({
//                 trainIndex: a.trainIndex,
//                 trainNo: a.trainNo,
//                 trainName: a.trainName,
//                 flightIndex: a.flightIndex,
//                 flightNo: a.flightNo,
//                 airline: a.airline,
//                 tripType: a.tripType,
//                 addonId: a.addonId,
//                 name: a.name,
//                 amount: Number(a.amount) || 0,
//               }))
//             : [],

//           // Admin/Aadhaar-OCR tracking — carried through as-is.
//           isCoTraveller: !!t.isCoTraveller,
//           aadhaar: t._aadhaar || null,
//         })),

//         payment: {
//           advance: { amount: amounts.advance },
//           balance: { amount: amounts.balance },
//         },

//         paymentScreenshots,
//       };

//       const data = await adminAddBooking(payload);

//       if (data.success) {
//         // If this booking came from an Aadhaar Upload group (Format 2 nav
//         // state), link the real tnr the backend just generated straight
//         // back onto that group — a direct, reliable link instead of
//         // relying on the phone-number heuristic in aadhaarController.js.
//         // Best-effort: never block navigation/success on this.
//         if (incoming.groupId && data.booking?.tnr) {
//           try {
//             await linkGroupTnr({
//               groupId: incoming.groupId,
//               tnr: data.booking.tnr,
//             });
//           } catch (linkErr) {
//             console.error("linkGroupTnr failed:", linkErr);
//           }
//         }
//         navigate("/admin-bookings");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Booking failed. Please check traveller details.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ── No tour picked yet (direct nav, Format 1 before selection) ──
//   if (!tourId) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
//         <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-10 max-w-lg w-full">
//           <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
//             Create Booking
//           </h1>
//           <label className="block text-base font-medium text-gray-800 mb-2">
//             Select Tour *
//           </label>
//           <select
//             value={tourId}
//             onChange={(e) => setTourId(e.target.value)}
//             className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
//           >
//             <option value="">-- Select a tour --</option>
//             {tourList?.map((t) => (
//               <option key={t._id} value={t._id}>
//                 {t.title}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>
//     );
//   }

//   if (!tourInfo) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <p className="text-xl text-gray-600 animate-pulse">Loading tour details...</p>
//       </div>
//     );
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return "Not specified";
//     return new Date(dateString).toLocaleDateString("en-IN", {
//       day: "numeric",
//       month: "long",
//       year: "numeric",
//     });
//   };

//   return (
//     <div
//       className="
//         w-full
//         max-w-[98%] xs:max-w-[96%] sm:max-w-[98%] md:max-w-[96vw]
//         lg:max-w-[94vw] xl:max-w-[92vw] 2xl:max-w-[90vw]
//         rounded-3xl sm:rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[3.5rem] xl:rounded-[4rem]
//         backdrop-blur-xl bg-white/40 border border-white/50
//         shadow-2xl md:shadow-[0_30px_90px_-15px_rgba(0,0,0,0.12)]
//         overflow-hidden
//         p-8 xs:p-10 sm:p-12 md:p-16 lg:p-20 xl:p-24
//       "
//     >
//       <div className="max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto">
//         <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 md:mb-10 text-center transition-all duration-500 hover:shadow-xl">
//           <div className="flex justify-between items-center mb-4">
//             <button
//               onClick={() => setTourId("")}
//               className="text-sm text-indigo-600 hover:underline font-medium"
//             >
//               ← Change Tour
//             </button>
//           </div>

//           <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
//             {tourInfo.title}
//           </h1>
//           <p className="text-lg sm:text-xl text-gray-600 mb-4">
//             {tourInfo.duration?.days} Days / {tourInfo.duration?.nights} Nights
//           </p>

//           <div className="mb-6">
//             <p className="text-base sm:text-lg font-medium text-gray-700">
//               Main Package Departure
//             </p>
//             <p className="text-lg sm:text-xl text-indigo-700 font-semibold">
//               {formatDate(tourInfo.lastBookingDate)}
//             </p>
//           </div>

//           {tourInfo.variantPackage && tourInfo.variantPackage.length > 0 && (
//             <div className="mt-6 pt-6 border-t border-gray-200">
//               <p className="text-base sm:text-lg font-medium text-gray-700 mb-4">
//                 Variant Package Departures
//               </p>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {tourInfo.variantPackage.map((variant, i) => (
//                   <div key={i} className="bg-indigo-50/70 rounded-xl p-4 text-left">
//                     <p className="text-sm sm:text-base font-medium text-gray-800">
//                       Variant {i + 1}
//                     </p>
//                     {variant.destination && (
//                       <p className="text-sm text-gray-600 mt-1">
//                         {variant.destination.join(", ")}
//                       </p>
//                     )}
//                     <p className="text-base sm:text-lg text-indigo-700 font-semibold mt-2">
//                       Departure: {formatDate(variant.lastBookingDate)}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {incoming.travellers?.length > 0 && (
//           <div className="mb-8 px-6 py-4 bg-blue-50 border border-blue-300 rounded-2xl text-blue-900 shadow-md text-center font-medium">
//             Pre-filled from Aadhaar Upload — verify and complete the remaining
//             booking details below.
//           </div>
//         )}

//         {/* Train/flight add-ons noted during Aadhaar Upload are now matched
//             against this tour's real trains/flights and auto-selected in the
//             Add-on dropdowns below (by train/flight number + leg + addon
//             name — the saved note has no addonId to match on directly). Any
//             note that couldn't be matched (addon renamed/removed from the
//             tour since the note was taken, say) still shows here so it
//             doesn't silently get missed. */}
//         {unmatchedAddonNotes.length > 0 && (
//           <div className="mb-8 px-6 py-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 shadow-md">
//             <p className="font-semibold mb-2 text-center">
//               Couldn't auto-match these add-ons noted during Aadhaar Upload —
//               select them manually below:
//             </p>
//             <div className="flex flex-wrap justify-center gap-2">
//               {unmatchedAddonNotes.map((a, i) => (
//                 <span
//                   key={i}
//                   className="px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-sm"
//                 >
//                   {a.label ? `${a.label} — ` : ""}
//                   {a.name}
//                   {a.amount ? ` (₹${a.amount})` : ""}
//                 </span>
//               ))}
//             </div>
//           </div>
//         )}
//         {incoming.bookingNotes?.remarks && (
//           <div className="mb-8 px-6 py-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 shadow-md text-center">
//             <span className="font-semibold">Remarks from Aadhaar Upload: </span>
//             {incoming.bookingNotes.remarks}
//           </div>
//         )}

//         <div className="space-y-6 sm:space-y-8">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
//             <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl">
//               <label className="block text-base sm:text-lg font-medium text-gray-800 mb-2 sm:mb-3">
//                 Contact Email
//               </label>
//               <input
//                 type="email"
//                 className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none"
//                 placeholder="your@email.com"
//                 value={contact.email}
//                 onChange={(e) =>
//                   setContact((prev) => ({ ...prev, email: e.target.value }))
//                 }
//               />
//             </div>
//             <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl">
//               <label className="block text-base sm:text-lg font-medium text-gray-800 mb-2 sm:mb-3">
//                 Mobile Number
//               </label>
//               <input
//                 type="tel"
//                 className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none"
//                 placeholder="Mobile number"
//                 value={contact.mobile}
//                 onChange={(e) =>
//                   setContact((prev) => ({ ...prev, mobile: e.target.value }))
//                 }
//               />
//             </div>
//           </div>

//           <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl">
//             <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
//               Billing Address (Optional)
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//               {[
//                 ["addressLine1", "Address Line 1"],
//                 ["addressLine2", "Address Line 2"],
//                 ["city", "City"],
//                 ["state", "State"],
//                 ["pincode", "Pincode"],
//                 ["country", "Country"],
//               ].map(([field, placeholder]) => (
//                 <input
//                   key={field}
//                   type="text"
//                   placeholder={placeholder}
//                   className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
//                   value={billingAddress[field]}
//                   onChange={(e) =>
//                     setBillingAddress((prev) => ({
//                       ...prev,
//                       [field]: e.target.value,
//                     }))
//                   }
//                 />
//               ))}
//             </div>
//           </div>

//           {Object.keys(paymentScreenshots).length > 0 && (
//             <div className="bg-green-50/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg border border-green-200">
//               <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-3">
//                 Payment Screenshots (from Aadhaar Upload)
//               </h3>
//               <div className="flex flex-wrap gap-3 text-sm text-green-800">
//                 {Object.entries(paymentScreenshots).map(([slot, data]) => (
//                   <span
//                     key={slot}
//                     className="px-3 py-1.5 bg-white rounded-lg border border-green-200 capitalize"
//                   >
//                     {slot}
//                     {data.amount ? ` — ${currencySymbol}${data.amount}` : ""} ✓
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div>
//             <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
//               Traveller Details
//             </h2>

//             {travellers.map((traveller, index) => {
//               const selectedPackage =
//                 traveller.packageType === "main"
//                   ? tourInfo
//                   : tourInfo.variantPackage?.[traveller.variantPackageIndex];

//               const trainDetails = selectedPackage?.trainDetails || [];
//               const flightDetailsAll = selectedPackage?.flightDetails || [];

//               const flightsWithAddons = flightDetailsAll
//                 .map((flight, flightIndexInPackage) => ({ flight, flightIndexInPackage }))
//                 .filter(
//                   ({ flight }) =>
//                     Array.isArray(flight.addons) && flight.addons.length > 0,
//                 );

//               const trainAddonsExist = trainDetails.some(
//                 (t) => Array.isArray(t.addons) && t.addons.length > 0,
//               );
//               const flightAddonsExist = flightsWithAddons.length > 0;
//               const hasLegAddons = trainAddonsExist || flightAddonsExist;
//               const flatAddons = selectedPackage?.addons || [];

//               return (
//                 <div
//                   key={index}
//                   className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 sm:p-8 mb-4 sm:mb-6 transition-all duration-500 hover:shadow-xl border border-indigo-100"
//                 >
//                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
//                     <h3 className="text-lg sm:text-xl font-semibold text-indigo-800 flex items-center gap-2">
//                       Traveller {index + 1}
//                       {traveller.isCoTraveller && (
//                         <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
//                           Aadhaar OCR
//                         </span>
//                       )}
//                     </h3>
//                     {travellers.length > 1 && (
//                       <button
//                         onClick={() => removeTraveller(index)}
//                         className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
//                       >
//                         Remove Traveller
//                       </button>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mb-4 sm:mb-6">
//                     <select
//                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
//                       value={
//                         traveller.packageType === "main"
//                           ? "main"
//                           : traveller.variantPackageIndex
//                       }
//                       onChange={(e) => {
//                         const value = e.target.value;
//                         if (value === "main") {
//                           handleTravellerChange(index, "packageType", "main");
//                           handleTravellerChange(index, "variantPackageIndex", null);
//                         } else {
//                           handleTravellerChange(index, "packageType", "variant");
//                           handleTravellerChange(index, "variantPackageIndex", Number(value));
//                         }
//                       }}
//                     >
//                       <option value="main">Main Package</option>
//                       {tourInfo.variantPackage?.map((pkg, i) => (
//                         <option key={i} value={i}>
//                           Variant {i + 1} ({pkg.destination?.join(", ")})
//                         </option>
//                       ))}
//                     </select>

//                     <select
//                       value={traveller.title}
//                       onChange={(e) => handleTravellerChange(index, "title", e.target.value)}
//                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
//                     >
//                       <option>Mr</option>
//                       <option>Mrs</option>
//                       <option>Ms</option>
//                     </select>

//                     <input
//                       type="text"
//                       placeholder="First Name (As per Aadhar)"
//                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
//                       value={traveller.firstName}
//                       onChange={(e) => handleTravellerChange(index, "firstName", e.target.value)}
//                     />

//                     <input
//                       type="text"
//                       placeholder="Last Name (As per Aadhar)"
//                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
//                       value={traveller.lastName}
//                       onChange={(e) => handleTravellerChange(index, "lastName", e.target.value)}
//                     />

//                     <input
//                       type="number"
//                       placeholder="Age"
//                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
//                       value={traveller.age}
//                       onChange={(e) => handleTravellerChange(index, "age", e.target.value)}
//                     />

//                     <select
//                       value={traveller.gender}
//                       onChange={(e) => handleTravellerChange(index, "gender", e.target.value)}
//                       className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
//                     >
//                       <option value="">Gender</option>
//                       <option>Male</option>
//                       <option>Female</option>
//                       <option>Other</option>
//                     </select>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-6">
//                     <div>
//                       <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
//                         Boarding Point
//                       </label>
//                       <select
//                         className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
//                         value={getPointId(traveller.boardingPoint)}
//                         onChange={(e) => {
//                           const pkg =
//                             traveller.packageType === "main"
//                               ? tourInfo
//                               : tourInfo.variantPackage?.[traveller.variantPackageIndex];
//                           const selectedBP = pkg?.boardingPoints?.find(
//                             (bp) => getPointId(bp) === e.target.value,
//                           );
//                           handleTravellerChange(index, "boardingPoint", selectedBP || null);
//                         }}
//                       >
//                         <option value="">Select Boarding Point</option>
//                         {(traveller.packageType === "main"
//                           ? tourInfo.boardingPoints
//                           : tourInfo.variantPackage?.[traveller.variantPackageIndex]
//                               ?.boardingPoints || []
//                         )?.map((bp, i) => (
//                           <option key={getPointId(bp) || i} value={getPointId(bp)}>
//                             {bp.stationCode} - {bp.stationName}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
//                         Deboarding Point
//                       </label>
//                       <select
//                         className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
//                         value={getPointId(traveller.deboardingPoint)}
//                         onChange={(e) => {
//                           const pkg =
//                             traveller.packageType === "main"
//                               ? tourInfo
//                               : tourInfo.variantPackage?.[traveller.variantPackageIndex];
//                           const selectedDP = pkg?.deboardingPoints?.find(
//                             (dp) => getPointId(dp) === e.target.value,
//                           );
//                           handleTravellerChange(index, "deboardingPoint", selectedDP || null);
//                         }}
//                       >
//                         <option value="">Select Deboarding Point</option>
//                         {(traveller.packageType === "main"
//                           ? tourInfo.deboardingPoints
//                           : tourInfo.variantPackage?.[traveller.variantPackageIndex]
//                               ?.deboardingPoints || []
//                         )?.map((dp, i) => (
//                           <option key={getPointId(dp) || i} value={getPointId(dp)}>
//                             {dp.stationCode} - {dp.stationName}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-6">
//                     <div>
//                       <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
//                         Sharing Type
//                       </label>
//                       <select
//                         value={traveller.sharingType}
//                         onChange={(e) => handleTravellerChange(index, "sharingType", e.target.value)}
//                         className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
//                       >
//                         <option value="">Select Sharing</option>
//                         {Number(traveller.age) >= 11 ? (
//                           <>
//                             <option value="double">Double Sharing</option>
//                             <option value="triple">Triple Sharing</option>
//                           </>
//                         ) : Number(traveller.age) >= 6 && Number(traveller.age) <= 10 ? (
//                           <>
//                             <option value="withBerth">Child with Berth</option>
//                             <option value="withoutBerth">Child without Berth</option>
//                           </>
//                         ) : null}
//                       </select>
//                     </div>

//                     {!hasLegAddons && flatAddons.length > 0 && (
//                       <div>
//                         <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
//                           Add-ons (Optional)
//                         </label>
//                         <select
//                           className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
//                           value={getSelectedFlatAddonId(traveller, flatAddons)}
//                           onChange={(e) => handleFlatAddonSelect(index, e.target.value, flatAddons)}
//                         >
//                           <option value="">No Add-on</option>
//                           {flatAddons.map((addon) => (
//                             <option key={addon._id || addon.id} value={addon._id || addon.id}>
//                               {addon.name} (+{currencySymbol}{addon.amount || 0})
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     )}
//                   </div>

//                   {hasLegAddons && (
//                     <>
//                       <div className="mt-6 pt-6 border-t border-gray-200">
//                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
//                           <div>
//                             <div className="flex items-center gap-2">
//                               <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-lg">
//                                 🚆
//                               </div>
//                               <h3 className="text-lg sm:text-xl font-bold text-gray-800">
//                                 TRAIN WISE ADD-ONS
//                               </h3>
//                             </div>
//                             <p className="text-sm text-gray-500 mt-1">
//                               Select add-ons for each trip
//                             </p>
//                           </div>
//                           <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
//                             <span className="text-sm font-semibold text-gray-600">TOTAL ADD ONS:</span>
//                             <span className="ml-2 text-base font-bold text-indigo-700">
//                               {currencySymbol}
//                               {(traveller.selectedAddons || []).reduce(
//                                 (total, addon) => total + (Number(addon.amount) || 0),
//                                 0,
//                               )}
//                             </span>
//                           </div>
//                         </div>

//                         {trainDetails.length > 0 ? (
//                           <div className="space-y-3">
//                             {trainDetails.map((train, trainIndex) => {
//                               const trainAddons = train.addons || [];
//                               return (
//                                 <div
//                                   key={train._id || trainIndex}
//                                   className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white hover:border-indigo-200 transition-all"
//                                 >
//                                   <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_300px] gap-4 items-center">
//                                     <div className="flex md:justify-center">
//                                       <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
//                                         {String(trainIndex + 1).padStart(2, "0")}
//                                       </div>
//                                     </div>
//                                     <div>
//                                       {train.tripType && (
//                                         <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase">
//                                           {train.tripType}
//                                         </span>
//                                       )}
//                                       <h4 className="text-base sm:text-lg font-semibold text-gray-800">
//                                         {train.trainName}{" "}
//                                         <span className="text-gray-500 font-medium">({train.trainNo})</span>
//                                       </h4>
//                                       <p className="text-sm text-gray-500 mt-1">
//                                         {train.fromStation}
//                                         <span className="mx-2 text-gray-400">→</span>
//                                         {train.toStation}
//                                       </p>
//                                     </div>
//                                     <div>
//                                       <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                                         Add-on
//                                       </label>
//                                       <select
//                                         className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
//                                         value={getSelectedAddonForTrain(traveller, trainIndex)}
//                                         onChange={(e) => handleAddonChange(index, trainIndex, e.target.value)}
//                                       >
//                                         <option value="">No Add-on</option>
//                                         {trainAddons.map((addon) => (
//                                           <option key={addon._id || addon.id} value={addon._id || addon.id}>
//                                             {addon.name} ({currencySymbol}{addon.amount || 0})
//                                           </option>
//                                         ))}
//                                       </select>
//                                     </div>
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         ) : (
//                           <div className="border border-dashed border-gray-300 rounded-xl p-5 text-center">
//                             <p className="text-sm text-gray-500">No train / trip details available.</p>
//                           </div>
//                         )}
//                       </div>

//                       {flightsWithAddons.length > 0 && (
//                         <div className="mt-6 pt-6 border-t border-gray-200">
//                           <div className="flex items-center gap-2 mb-4">
//                             <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 text-lg">
//                               ✈️
//                             </div>
//                             <h3 className="text-lg sm:text-xl font-bold text-gray-800">
//                               FLIGHT WISE ADD-ONS
//                             </h3>
//                           </div>
//                           <div className="space-y-3">
//                             {flightsWithAddons.map(({ flight, flightIndexInPackage }) => (
//                               <div
//                                 key={flight._id || flightIndexInPackage}
//                                 className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white hover:border-purple-200 transition-all"
//                               >
//                                 <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_300px] gap-4 items-center">
//                                   <div className="flex md:justify-center">
//                                     <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
//                                       {String(flightIndexInPackage + 1).padStart(2, "0")}
//                                     </div>
//                                   </div>
//                                   <div>
//                                     {flight.tripType && (
//                                       <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold uppercase">
//                                         {flight.tripType}
//                                       </span>
//                                     )}
//                                     <h4 className="text-base sm:text-lg font-semibold text-gray-800">
//                                       {flight.airline}{" "}
//                                       <span className="text-gray-500 font-medium">({flight.flightNo})</span>
//                                     </h4>
//                                     <p className="text-sm text-gray-500 mt-1">
//                                       {flight.fromAirport}
//                                       <span className="mx-2 text-gray-400">→</span>
//                                       {flight.toAirport}
//                                     </p>
//                                   </div>
//                                   <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1.5">
//                                       Add-on
//                                     </label>
//                                     <select
//                                       className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all"
//                                       value={getSelectedAddonForFlight(traveller, flightIndexInPackage)}
//                                       onChange={(e) =>
//                                         handleFlightAddonChange(index, flightIndexInPackage, e.target.value)
//                                       }
//                                     >
//                                       <option value="">No Add-on</option>
//                                       {(flight.addons || []).map((addon) => (
//                                         <option key={addon._id || addon.id} value={addon._id || addon.id}>
//                                           {addon.name} ({currencySymbol}{addon.amount || 0})
//                                         </option>
//                                       ))}
//                                     </select>
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </>
//                   )}

//                   <textarea
//                     className="w-full mt-6 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 resize-none"
//                     rows="3"
//                     placeholder="Remarks (optional)"
//                     value={traveller.remarks}
//                     onChange={(e) => handleTravellerChange(index, "remarks", e.target.value)}
//                   />
//                 </div>
//               );
//             })}

//             <button
//               onClick={addTraveller}
//               className="bg-indigo-100 text-indigo-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:bg-indigo-200 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto"
//             >
//               + Add Another Traveller
//             </button>
//           </div>

//           <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
//             <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
//               Booking Summary
//             </h3>
//             <div className="space-y-3 sm:space-y-5 text-base sm:text-lg text-gray-700">
//               <div className="flex justify-between">
//                 <span>Advance Amount:</span>
//                 <strong className="text-indigo-700">{currencySymbol}{amounts.advance}/-</strong>
//               </div>
//               <div className="flex justify-between">
//                 <span>Balance Amount:</span>
//                 <strong className="text-indigo-700">{currencySymbol}{amounts.balance}/-</strong>
//               </div>
//               <div className="flex justify-between">
//                 <span>Add-ons Total:</span>
//                 <strong className="text-indigo-700">{currencySymbol}{amounts.addonsTotal}/-</strong>
//               </div>
//               <hr className="border-gray-200" />
//               <div className="flex justify-between text-xl sm:text-2xl font-bold text-gray-800 pt-2 sm:pt-3">
//                 <span>Total Payable:</span>
//                 <span className="text-indigo-800">{currencySymbol}{amounts.advance + amounts.balance}/-</span>
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={handleAddToTrolly}
//             disabled={isSubmitting}
//             className={`w-full py-4 sm:py-5 rounded-2xl text-white font-bold text-lg sm:text-xl transition-all duration-500 transform hover:scale-[1.02] shadow-xl ${
//               isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
//             } ${isSubmitting ? "" : "hover:shadow-2xl"}`}
//           >
//             {isSubmitting ? (
//               <span className="flex items-center justify-center gap-3">
//                 <svg className="animate-spin h-5 sm:h-6 w-5 sm:w-6" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
//                 </svg>
//                 Adding to Trolly...
//               </span>
//             ) : (
//               "Add to Trolly"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateBooking;


import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TourContext } from "../../context/TourContext";
import { toast } from "react-toastify";

// stationCode is NOT guaranteed unique within a tour's boardingPoints /
// deboardingPoints array (same mirrors the customer-facing TourBooking.jsx
// fix) — select/match by each point's own _id instead.
const getPointId = (point) => {
  if (!point) return "";
  const raw = point._id;
  if (raw && typeof raw === "object" && raw.$oid) return String(raw.$oid);
  return raw !== undefined && raw !== null ? String(raw) : "";
};

// Blank traveller — same shape as the customer-facing booking form, plus
// two admin-only fields: isCoTraveller/aadhaar (hidden, not rendered,
// forwarded as-is to the backend) that track whether this traveller came
// through Aadhaar OCR on the Aadhaar Upload page.
const blankTraveller = () => ({
  title: "Mr",
  firstName: "",
  lastName: "",
  age: "",
  gender: "Male",
  sharingType: "",
  selectedAddon: null,
  selectedAddons: [],
  boardingPoint: null,
  deboardingPoint: null,
  remarks: "",
  packageType: "main",
  variantPackageIndex: null,
  isCoTraveller: false,
  _aadhaar: null, // { front, back } once OCR'd — never rendered, just carried through
});

// Merge an OCR-prefilled traveller (from AadhaarUpload: title/firstName/
// lastName/age/gender/isCoTraveller/_aadhaar only) onto the full blank
// shape so every booking-specific field the admin still has to fill
// (package, sharing, boarding/deboarding, addons, remarks) is present.
const hydrateTraveller = (partial) => ({
  ...blankTraveller(),
  ...partial,
});

const CreateBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    tourList,
    getTourList,
    // TourContext.jsx never actually defines/exports a currencySymbol value
    // at all (checked — it's not in that file), so this was ALWAYS
    // undefined here. Inside plain JSX ({currencySymbol}) React silently
    // renders undefined as nothing, which is why the ₹ symbol just looked
    // "missing" most places — but inside a template literal
    // (`${currencySymbol}${amount}`), JS stringifies undefined as the
    // literal text "undefined", which is exactly the "Advance —
    // Undefined10000" bug reported on the Payment Screenshots chip (the
    // "capitalize" CSS class then capitalizes it to "Undefined"). The
    // default below fixes it at the one place this component reads it,
    // without having to touch TourContext.jsx itself.
    currencySymbol = "₹",
    adminAddBooking,
    linkGroupTnr,
  } = useContext(TourContext);

  // ── Format 1: direct nav (no state) → manual booking, admin picks the
  // tour from the dropdown below.
  // ── Format 2: nav'd from AadhaarUpload with { tourId, travellers,
  // paymentScreenshots, contactMobile, contactAddress, groupId } in state →
  // everything pre-filled. contactMobile/contactAddress/groupId were always
  // being sent here but never read — contact.mobile and billingAddress
  // stayed blank below regardless, and groupId (which would let this page
  // link the real tnr straight back to that Aadhaar Upload group) was
  // dropped on the floor entirely.
  const incoming = location.state || {};

  const [tourId, setTourId] = useState(incoming.tourId || "");
  const [tourInfo, setTourInfo] = useState(null);
  const [bookingType] = useState("offline"); // admin walk-ins are always offline/in-person
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── "Add to Trolly" confirm → cancellable countdown ──────────────────
  // Clicking "Add to Trolly" used to call the booking API immediately.
  // Now it's a 3-step flow: (1) validate + show a "Confirm this booking?"
  // summary modal, (2) on Confirm, start a short countdown with a visible
  // Cancel button — the API call itself hasn't happened yet during this
  // window, so Cancel is a true no-op abort, not an undo of something
  // already saved, (3) only once the countdown finishes without a cancel
  // does the real adminAddBooking call fire.
  const UNDO_WINDOW_SECONDS = 6;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState(0);
  const undoTimerRef = useRef(null);
  const undoCancelledRef = useRef(false);

  // Stop the countdown's interval from firing after this page is left
  // (e.g. the admin navigates away mid-countdown) — otherwise it would
  // try to setState on an unmounted component and could still fire the
  // booking call after the admin already clicked away.
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    };
  }, []);

  const [travellers, setTravellers] = useState(
    incoming.travellers?.length > 0
      ? incoming.travellers.map(hydrateTraveller)
      : [blankTraveller()],
  );

  const [paymentScreenshots] = useState(incoming.paymentScreenshots || {});

  const [amounts, setAmounts] = useState({
    advance: 0,
    balance: 0,
    addonsTotal: 0,
  });

  // Prefilled from AadhaarUpload's nav state when present (Format 2) —
  // the admin no longer has to retype the phone number/address that were
  // already captured during Aadhaar Upload.
  const [contact, setContact] = useState({
    email: "",
    mobile: incoming.contactMobile || "",
  });

  // AadhaarUpload.jsx's OCR already splits the main traveller's address
  // into addressLine1/addressLine2/city/state/pincode (see
  // splitAddressComponents in aadhaarController.js) — it just wasn't being
  // forwarded here. This used to only receive one flattened
  // `contactAddress` string and cram the WHOLE thing into addressLine1,
  // leaving City/State/Pincode blank even though OCR had already read
  // them. Now it prefers the split fields when AadhaarUpload sent them,
  // and only falls back to stuffing the combined string into Line 1 for
  // an older nav state that doesn't have the split fields at all.
  const [billingAddress, setBillingAddress] = useState({
    addressLine1:
      incoming.contactAddressLine1 || incoming.contactAddress || "",
    addressLine2: incoming.contactAddressLine2 || "",
    city: incoming.contactCity || "",
    state: incoming.contactState || "",
    pincode: incoming.contactPincode || "",
    country: "India",
  });

  useEffect(() => {
    if (!tourList || tourList.length === 0) getTourList();
  }, [tourList, getTourList]);

  useEffect(() => {
    if (!tourId || !tourList?.length) {
      setTourInfo(null);
      return;
    }
    const t = tourList.find((tour) => tour._id === tourId);
    setTourInfo(t || null);
  }, [tourId, tourList]);

  // Auto-fill boarding/deboarding point AND train/flight add-ons from the
  // Aadhaar Upload capture. bookingNotes stores these as plain text (see
  // AadhaarUpload.jsx's handleSaveBooking): boardingPoint/deboardingPoint
  // as "STATIONCODE - Station Name", and addonsDetail as
  // [{ label: "HAMSAFER (23456) - BOARDING", name: "3AC Extra", amount }]
  // — none of it carries the real _ids the dropdowns below need, so it has
  // to be matched back onto this tour's actual boardingPoints/
  // deboardingPoints/trainDetails/flightDetails.
  //
  // Everything is computed and applied in ONE setTravellers call (rather
  // than several handleTravellerChange/handleAddonChange calls) because
  // those all read the same stale `travellers` closure from this effect —
  // calling them one after another would make each call overwrite the
  // previous one's change instead of combining.
  //
  // Unmatched add-on notes (train/addon renamed or removed from the tour
  // since Aadhaar Upload, say) are kept in `unmatchedAddonNotes` so they
  // still show as a reminder banner instead of silently vanishing.
  const bookingNotesAppliedRef = useRef(false);
  const [unmatchedAddonNotes, setUnmatchedAddonNotes] = useState([]);
  useEffect(() => {
    if (!tourInfo || bookingNotesAppliedRef.current) return;
    const notes = incoming.bookingNotes;
    if (!notes) return;
    bookingNotesAppliedRef.current = true;

    setTravellers((prev) => {
      const updated = prev.map((t) => ({
        ...t,
        selectedAddons: Array.isArray(t.selectedAddons) ? [...t.selectedAddons] : [],
      }));
      const mainTraveller = updated[0];
      if (!mainTraveller) return prev;

      const pkg =
        mainTraveller.packageType === "variant"
          ? tourInfo.variantPackage?.[mainTraveller.variantPackageIndex]
          : tourInfo;
      if (!pkg) return prev;

      const matchPoint = (str, list) => {
        if (!str) return null;
        const code = str.split(" - ")[0]?.trim().toUpperCase();
        if (!code) return null;
        return (
          (list || []).find(
            (p) => (p.stationCode || "").trim().toUpperCase() === code,
          ) || null
        );
      };

      const bp = matchPoint(notes.boardingPoint, pkg.boardingPoints);
      const dp = matchPoint(notes.deboardingPoint, pkg.deboardingPoints);

      const matchedAddons = [];
      const unmatched = [];
      (notes.addonsDetail || []).forEach((detail) => {
        if (!detail?.name || !detail?.label) {
          if (detail?.name) unmatched.push(detail);
          return;
        }
        const numMatch = detail.label.match(/\(([^)]+)\)/);
        const num = numMatch?.[1]?.trim();
        const legPart = detail.label.split(" - ")[1]?.trim().toUpperCase();
        const addonName = detail.name.trim().toLowerCase();

        const trainIndex = (pkg.trainDetails || []).findIndex((t) => {
          const noOk = num && String(t.trainNo || "").trim() === num;
          const legOk =
            !legPart || String(t.tripType || "").trim().toUpperCase() === legPart;
          return noOk && legOk;
        });
        if (trainIndex !== -1) {
          const train = pkg.trainDetails[trainIndex];
          const addon = (train.addons || []).find(
            (a) => (a.name || "").trim().toLowerCase() === addonName,
          );
          if (addon) {
            matchedAddons.push({
              trainIndex,
              trainNo: train.trainNo,
              trainName: train.trainName,
              tripType: train.tripType,
              addonId: addon._id || addon.id,
              name: addon.name,
              amount: Number(addon.amount) || 0,
              addedAt: new Date(),
            });
            return;
          }
        }

        const flightIndex = (pkg.flightDetails || []).findIndex((f) => {
          const noOk = num && String(f.flightNo || "").trim() === num;
          const legOk =
            !legPart || String(f.tripType || "").trim().toUpperCase() === legPart;
          return noOk && legOk;
        });
        if (flightIndex !== -1) {
          const flight = pkg.flightDetails[flightIndex];
          const addon = (flight.addons || []).find(
            (a) => (a.name || "").trim().toLowerCase() === addonName,
          );
          if (addon) {
            matchedAddons.push({
              flightIndex,
              flightNo: flight.flightNo,
              airline: flight.airline,
              tripType: flight.tripType,
              addonId: addon._id || addon.id,
              name: addon.name,
              amount: Number(addon.amount) || 0,
              addedAt: new Date(),
            });
            return;
          }
        }

        unmatched.push(detail);
      });

      updated.forEach((t) => {
        const samePackage =
          t.packageType === mainTraveller.packageType &&
          (t.packageType !== "variant" ||
            t.variantPackageIndex === mainTraveller.variantPackageIndex);
        if (!samePackage) return;
        if (bp) t.boardingPoint = bp;
        if (dp) t.deboardingPoint = dp;
        if (matchedAddons.length) {
          let sa = Array.isArray(t.selectedAddons) ? [...t.selectedAddons] : [];
          matchedAddons.forEach((ma) => {
            sa = sa.filter(
              (a) =>
                (ma.trainIndex === undefined || a.trainIndex !== ma.trainIndex) &&
                (ma.flightIndex === undefined || a.flightIndex !== ma.flightIndex),
            );
          });
          t.selectedAddons = [...sa, ...matchedAddons];
        }
      });

      setUnmatchedAddonNotes(unmatched);
      return updated;
    });
  }, [tourInfo]);

  useEffect(() => {
    if (!tourInfo) return;

    let totalAdvance = 0;
    let totalBalance = 0;
    let totalAddons = 0;

    travellers.forEach((t) => {
      const age = Number(t.age);
      let travellerAdvance = 0;
      let travellerBalance = 0;

      const selectedPackage =
        t.packageType === "main"
          ? tourInfo
          : tourInfo.variantPackage?.[t.variantPackageIndex];

      if (!selectedPackage) return;

      if (age >= 11) {
        travellerAdvance = Number(selectedPackage.advanceAmount?.adult) || 0;
        if (t.sharingType === "double") {
          travellerBalance = Number(selectedPackage.balanceDouble) || 0;
        } else if (t.sharingType === "triple") {
          travellerBalance = Number(selectedPackage.balanceTriple) || 0;
        }
      } else if (age >= 6 && age <= 10) {
        travellerAdvance = Number(selectedPackage.advanceAmount?.child) || 0;
        if (t.sharingType === "withBerth") {
          travellerBalance = Number(selectedPackage.balanceChildWithBerth) || 0;
        } else if (t.sharingType === "withoutBerth") {
          travellerBalance =
            Number(selectedPackage.balanceChildWithoutBerth) || 0;
        }
      }

      const travellerAddons = Array.isArray(t.selectedAddons)
        ? t.selectedAddons
        : [];
      travellerAddons.forEach((addon) => {
        const addonPrice = Number(addon.amount) || 0;
        totalAddons += addonPrice;
        travellerAdvance += addonPrice;
      });

      const flatAddonPrice = Number(t.selectedAddon?.price) || 0;
      totalAddons += flatAddonPrice;
      travellerAdvance += flatAddonPrice;

      totalAdvance += travellerAdvance;
      totalBalance += travellerBalance;
    });

    setAmounts({
      advance: totalAdvance,
      balance: totalBalance,
      addonsTotal: totalAddons,
    });
  }, [travellers, tourInfo]);

  const handleTravellerChange = (index, field, value) => {
    const updated = [...travellers];

    if (field === "title") {
      if (value === "Mr") updated[index].gender = "Male";
      else if (value === "Mrs" || value === "Ms") updated[index].gender = "Female";
    }
    if (field === "gender") {
      if (value === "Male") updated[index].title = "Mr";
      else if (value === "Female") updated[index].title = "Ms";
    }
    if (field === "age") {
      const age = Number(value);
      if (age > 85) {
        toast.error("Age cannot exceed 85 years.");
        return;
      }
      if (age >= 11) updated[index].sharingType = "double";
      else if (age >= 6 && age <= 10) updated[index].sharingType = "withBerth";
      else updated[index].sharingType = "";
    }

    updated[index][field] = value;

    if (field === "packageType" || field === "variantPackageIndex") {
      updated[index].boardingPoint = null;
      updated[index].deboardingPoint = null;
      updated[index].selectedAddon = null;
      updated[index].selectedAddons = [];
    }

    // Booking details (boarding/deboarding point) are the same trip for
    // every traveller in one booking — setting it on any one traveller
    // sets it on every traveller sharing the same package, instead of
    // the admin having to repeat it per traveller.
    if (field === "boardingPoint" || field === "deboardingPoint") {
      const changed = updated[index];
      updated.forEach((t, i) => {
        if (i === index) return;
        const samePackage =
          t.packageType === changed.packageType &&
          (t.packageType !== "variant" ||
            t.variantPackageIndex === changed.variantPackageIndex);
        if (samePackage) {
          t[field] = value;
        }
      });
    }

    setTravellers(updated);
  };

  const addTraveller = () => setTravellers([...travellers, blankTraveller()]);

  const removeTraveller = (index) =>
    setTravellers(travellers.filter((_, i) => i !== index));

  const handleAddonChange = (travellerIndex, trainIndex, addonId) => {
    const updated = [...travellers];
    const traveller = updated[travellerIndex];
    const selectedPackage =
      traveller.packageType === "main"
        ? tourInfo
        : tourInfo.variantPackage?.[traveller.variantPackageIndex];
    const train = selectedPackage?.trainDetails?.[trainIndex];
    if (!train) return;

    const selectedAddon = addonId
      ? train.addons?.find((a) => String(a._id || a.id) === String(addonId))
      : null;

    const applyTo = (t) => {
      let selectedAddons = Array.isArray(t.selectedAddons)
        ? [...t.selectedAddons]
        : [];
      selectedAddons = selectedAddons.filter((a) => a.trainIndex !== trainIndex);
      if (addonId && selectedAddon) {
        selectedAddons.push({
          trainIndex,
          trainNo: train.trainNo,
          trainName: train.trainName,
          tripType: train.tripType,
          addonId: selectedAddon._id || selectedAddon.id,
          name: selectedAddon.name,
          amount: Number(selectedAddon.amount) || 0,
          addedAt: new Date(),
        });
      }
      t.selectedAddons = selectedAddons;
    };

    // Same "booking details are shared across the group" rule as the
    // boarding/deboarding point: a train add-on picked for one traveller
    // applies to every traveller riding the same package, not just the
    // one the dropdown was touched on.
    updated.forEach((t) => {
      const samePackage =
        t.packageType === traveller.packageType &&
        (t.packageType !== "variant" ||
          t.variantPackageIndex === traveller.variantPackageIndex);
      if (samePackage) applyTo(t);
    });

    setTravellers(updated);
  };

  const handleFlightAddonChange = (travellerIndex, flightIndex, addonId) => {
    const updated = [...travellers];
    const traveller = updated[travellerIndex];
    const selectedPackage =
      traveller.packageType === "main"
        ? tourInfo
        : tourInfo.variantPackage?.[traveller.variantPackageIndex];
    const flight = selectedPackage?.flightDetails?.[flightIndex];
    if (!flight) return;

    const selectedAddon = addonId
      ? flight.addons?.find((a) => String(a._id || a.id) === String(addonId))
      : null;

    const applyTo = (t) => {
      let selectedAddons = Array.isArray(t.selectedAddons)
        ? [...t.selectedAddons]
        : [];
      selectedAddons = selectedAddons.filter((a) => a.flightIndex !== flightIndex);
      if (addonId && selectedAddon) {
        selectedAddons.push({
          flightIndex,
          flightNo: flight.flightNo,
          airline: flight.airline,
          tripType: flight.tripType,
          addonId: selectedAddon._id || selectedAddon.id,
          name: selectedAddon.name,
          amount: Number(selectedAddon.amount) || 0,
          addedAt: new Date(),
        });
      }
      t.selectedAddons = selectedAddons;
    };

    // Same sharing rule as the train add-on handler above — a flight
    // add-on picked for one traveller applies to the whole group on
    // this package.
    updated.forEach((t) => {
      const samePackage =
        t.packageType === traveller.packageType &&
        (t.packageType !== "variant" ||
          t.variantPackageIndex === traveller.variantPackageIndex);
      if (samePackage) applyTo(t);
    });

    setTravellers(updated);
  };

  const handleFlatAddonSelect = (travellerIndex, addonId, flatAddonsList) => {
    const updated = [...travellers];
    const traveller = updated[travellerIndex];
    const selected = addonId
      ? flatAddonsList.find((a) => String(a._id || a.id) === String(addonId))
      : null;
    const value = selected
      ? { name: selected.name, price: Number(selected.amount) || 0 }
      : null;

    // Same sharing rule as the other add-on handlers — applies to every
    // traveller on the same package.
    updated.forEach((t) => {
      const samePackage =
        t.packageType === traveller.packageType &&
        (t.packageType !== "variant" ||
          t.variantPackageIndex === traveller.variantPackageIndex);
      if (samePackage) t.selectedAddon = value;
    });

    setTravellers(updated);
  };

  const getSelectedFlatAddonId = (traveller, flatAddonsList) => {
    const flat = traveller?.selectedAddon;
    if (!flat?.name) return "";
    const match = (flatAddonsList || []).find((a) => a.name === flat.name);
    return match ? String(match._id || match.id) : "";
  };

  const getSelectedAddonForTrain = (traveller, trainIndex) => {
    const selectedAddons = Array.isArray(traveller.selectedAddons)
      ? traveller.selectedAddons
      : [];
    return (
      selectedAddons.find((a) => a.trainIndex === trainIndex)?.addonId || ""
    );
  };

  const getSelectedAddonForFlight = (traveller, flightIndex) => {
    const selectedAddons = Array.isArray(traveller.selectedAddons)
      ? traveller.selectedAddons
      : [];
    return (
      selectedAddons.find((a) => a.flightIndex === flightIndex)?.addonId || ""
    );
  };

  // Step 1 — runs on the "Add to Trolly" button itself. Pure validation,
  // no API call and no spinner yet: if everything checks out, this just
  // opens the confirm modal (handleAddToTrolly below is what actually
  // submits, and only after the countdown in step 2 finishes).
  const handleAddToTrollyClick = () => {
    if (!tourId) {
      toast.error("Select a tour first");
      return;
    }

    for (let [idx, t] of travellers.entries()) {
      const age = Number(t.age);

      if (!t.firstName?.trim()) {
        toast.error(`Traveller ${idx + 1}: First Name is required (As per Aadhar).`);
        return;
      }
      if (!t.lastName?.trim()) {
        toast.error(`Traveller ${idx + 1}: Last Name is required (As per Aadhar).`);
        return;
      }
      if (isNaN(age) || age < 1) {
        toast.error(`Invalid age for traveller: ${t.firstName || "Unnamed"}.`);
        return;
      }
      if (!t.gender) {
        toast.error("Please select gender for all travellers.");
        return;
      }
      if (!t.sharingType) {
        toast.error("Please select a sharing type for all travellers.");
        return;
      }
      if (!t.boardingPoint) {
        toast.error("Please select a boarding point for all travellers.");
        return;
      }
      if (!t.deboardingPoint) {
        toast.error("Please select a deboarding point for all travellers.");
        return;
      }
      if (t.packageType === "variant" && t.variantPackageIndex === null) {
        toast.error(`Please select a variant package for traveller: ${t.firstName}.`);
        return;
      }
    }

    // Validation passed — ask for confirmation before anything is sent.
    setConfirmOpen(true);
  };

  // Step 2 — the admin clicked "Confirm" on the summary modal. Starts the
  // cancellable countdown; the API call is NOT made yet, so a click on
  // "Cancel" during this window is a true no-op (nothing to undo because
  // nothing was ever sent).
  const startUndoWindow = () => {
    setConfirmOpen(false);
    undoCancelledRef.current = false;
    setIsSubmitting(true);
    setUndoSecondsLeft(UNDO_WINDOW_SECONDS);

    undoTimerRef.current = setInterval(() => {
      setUndoSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(undoTimerRef.current);
          if (!undoCancelledRef.current) handleAddToTrolly();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // The admin clicked "Cancel" during the countdown — stop it, nothing
  // was ever sent to the server, so there's nothing to revert.
  const cancelUndoWindow = () => {
    undoCancelledRef.current = true;
    if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    setUndoSecondsLeft(0);
    setIsSubmitting(false);
    toast("Booking not created — cancelled.", { icon: "↩️" });
  };

  // Step 3 — countdown finished without a cancel. This is the ORIGINAL
  // submit logic (payload build + adminAddBooking + navigate), unchanged,
  // just no longer triggered directly by the button click.
  const handleAddToTrolly = async () => {
    const billingData =
      billingAddress.addressLine1.trim() ||
      billingAddress.city.trim() ||
      billingAddress.state.trim() ||
      billingAddress.pincode.trim()
        ? billingAddress
        : null;

    try {
      const payload = {
        tourId,
        bookingType,
        contact,
        billingAddress: billingData,

        travellers: travellers.map((t) => ({
          title: t.title,
          firstName: t.firstName?.trim(),
          lastName: t.lastName?.trim(),
          age: Number(t.age),
          gender: t.gender,
          packageType: t.packageType,
          variantPackageIndex:
            t.packageType === "variant" ? t.variantPackageIndex : null,
          sharingType: t.sharingType,
          boardingPoint: t.boardingPoint,
          deboardingPoint: t.deboardingPoint,
          remarks: t.remarks?.trim() || null,

          selectedAddon: t.selectedAddon
            ? { name: t.selectedAddon.name, price: Number(t.selectedAddon.price) || 0 }
            : null,
          selectedAddons: Array.isArray(t.selectedAddons)
            ? t.selectedAddons.map((a) => ({
                trainIndex: a.trainIndex,
                trainNo: a.trainNo,
                trainName: a.trainName,
                flightIndex: a.flightIndex,
                flightNo: a.flightNo,
                airline: a.airline,
                tripType: a.tripType,
                addonId: a.addonId,
                name: a.name,
                amount: Number(a.amount) || 0,
              }))
            : [],

          // Admin/Aadhaar-OCR tracking — carried through as-is.
          isCoTraveller: !!t.isCoTraveller,
          aadhaar: t._aadhaar || null,
        })),

        payment: {
          advance: { amount: amounts.advance },
          balance: { amount: amounts.balance },
        },

        paymentScreenshots,
      };

      const data = await adminAddBooking(payload);

      if (data.success) {
        // If this booking came from an Aadhaar Upload group (Format 2 nav
        // state), link the real tnr the backend just generated straight
        // back onto that group — a direct, reliable link instead of
        // relying on the phone-number heuristic in aadhaarController.js.
        // Best-effort: never block navigation/success on this.
        if (incoming.groupId && data.booking?.tnr) {
          try {
            await linkGroupTnr({
              groupId: incoming.groupId,
              tnr: data.booking.tnr,
            });
          } catch (linkErr) {
            console.error("linkGroupTnr failed:", linkErr);
          }
        }
        navigate("/admin-bookings");
      }
    } catch (error) {
      console.error(error);
      toast.error("Booking failed. Please check traveller details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── No tour picked yet (direct nav, Format 1 before selection) ──
  if (!tourId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-10 max-w-lg w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Create Booking
          </h1>
          <label className="block text-base font-medium text-gray-800 mb-2">
            Select Tour *
          </label>
          <select
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
          >
            <option value="">-- Select a tour --</option>
            {tourList?.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (!tourInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-xl text-gray-600 animate-pulse">Loading tour details...</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
    {/* NOTE: the confirm/countdown modals below are rendered OUTSIDE this
        wrapper on purpose. This wrapper uses backdrop-blur-xl + overflow-hidden,
        and per the CSS spec backdrop-filter creates a new containing block for
        any `position: fixed` descendant — so a modal nested inside here would
        actually be "fixed" relative to THIS box (and clipped by overflow-hidden),
        not the real browser viewport. That's what was making the confirm popup
        drift / get clipped depending on scroll position. Keeping the modals as
        siblings of this div (via the <> Fragment) makes them truly viewport-fixed,
        same as the working AllTourBookings.jsx modal. */}
    <div
      className="
        w-full
        max-w-[98%] xs:max-w-[96%] sm:max-w-[98%] md:max-w-[96vw]
        lg:max-w-[94vw] xl:max-w-[92vw] 2xl:max-w-[90vw]
        rounded-3xl sm:rounded-[2.5rem] md:rounded-[3rem] lg:rounded-[3.5rem] xl:rounded-[4rem]
        backdrop-blur-xl bg-white/40 border border-white/50
        shadow-2xl md:shadow-[0_30px_90px_-15px_rgba(0,0,0,0.12)]
        overflow-hidden
        p-8 xs:p-10 sm:p-12 md:p-16 lg:p-20 xl:p-24
      "
    >
      <div className="max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 md:mb-10 text-center transition-all duration-500 hover:shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setTourId("")}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              ← Change Tour
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
            {tourInfo.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-4">
            {tourInfo.duration?.days} Days / {tourInfo.duration?.nights} Nights
          </p>

          <div className="mb-6">
            <p className="text-base sm:text-lg font-medium text-gray-700">
              Main Package Departure
            </p>
            <p className="text-lg sm:text-xl text-indigo-700 font-semibold">
              {formatDate(tourInfo.lastBookingDate)}
            </p>
          </div>

          {tourInfo.variantPackage && tourInfo.variantPackage.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-base sm:text-lg font-medium text-gray-700 mb-4">
                Variant Package Departures
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tourInfo.variantPackage.map((variant, i) => (
                  <div key={i} className="bg-indigo-50/70 rounded-xl p-4 text-left">
                    <p className="text-sm sm:text-base font-medium text-gray-800">
                      Variant {i + 1}
                    </p>
                    {variant.destination && (
                      <p className="text-sm text-gray-600 mt-1">
                        {variant.destination.join(", ")}
                      </p>
                    )}
                    <p className="text-base sm:text-lg text-indigo-700 font-semibold mt-2">
                      Departure: {formatDate(variant.lastBookingDate)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {incoming.travellers?.length > 0 && (
          <div className="mb-8 px-6 py-4 bg-blue-50 border border-blue-300 rounded-2xl text-blue-900 shadow-md text-center font-medium">
            Pre-filled from Aadhaar Upload — verify and complete the remaining
            booking details below.
          </div>
        )}

        {/* Train/flight add-ons noted during Aadhaar Upload are now matched
            against this tour's real trains/flights and auto-selected in the
            Add-on dropdowns below (by train/flight number + leg + addon
            name — the saved note has no addonId to match on directly). Any
            note that couldn't be matched (addon renamed/removed from the
            tour since the note was taken, say) still shows here so it
            doesn't silently get missed. */}
        {unmatchedAddonNotes.length > 0 && (
          <div className="mb-8 px-6 py-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 shadow-md">
            <p className="font-semibold mb-2 text-center">
              Couldn't auto-match these add-ons noted during Aadhaar Upload —
              select them manually below:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {unmatchedAddonNotes.map((a, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-sm"
                >
                  {a.label ? `${a.label} — ` : ""}
                  {a.name}
                  {a.amount ? ` (₹${a.amount})` : ""}
                </span>
              ))}
            </div>
          </div>
        )}
        {incoming.bookingNotes?.remarks && (
          <div className="mb-8 px-6 py-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 shadow-md text-center">
            <span className="font-semibold">Remarks from Aadhaar Upload: </span>
            {incoming.bookingNotes.remarks}
          </div>
        )}

        <div className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl">
              <label className="block text-base sm:text-lg font-medium text-gray-800 mb-2 sm:mb-3">
                Contact Email
              </label>
              <input
                type="email"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none"
                placeholder="your@email.com"
                value={contact.email}
                onChange={(e) =>
                  setContact((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl">
              <label className="block text-base sm:text-lg font-medium text-gray-800 mb-2 sm:mb-3">
                Mobile Number
              </label>
              <input
                type="tel"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none"
                placeholder="Mobile number"
                value={contact.mobile}
                onChange={(e) =>
                  setContact((prev) => ({ ...prev, mobile: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg transition-all hover:shadow-xl">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
              Billing Address (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                ["addressLine1", "Address Line 1"],
                ["addressLine2", "Address Line 2"],
                ["city", "City"],
                ["state", "State"],
                ["pincode", "Pincode"],
                ["country", "Country"],
              ].map(([field, placeholder]) => (
                <input
                  key={field}
                  type="text"
                  placeholder={placeholder}
                  className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                  value={billingAddress[field]}
                  onChange={(e) =>
                    setBillingAddress((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              Traveller Details
            </h2>

            {travellers.map((traveller, index) => {
              const selectedPackage =
                traveller.packageType === "main"
                  ? tourInfo
                  : tourInfo.variantPackage?.[traveller.variantPackageIndex];

              const trainDetails = selectedPackage?.trainDetails || [];
              const flightDetailsAll = selectedPackage?.flightDetails || [];

              const flightsWithAddons = flightDetailsAll
                .map((flight, flightIndexInPackage) => ({ flight, flightIndexInPackage }))
                .filter(
                  ({ flight }) =>
                    Array.isArray(flight.addons) && flight.addons.length > 0,
                );

              const trainAddonsExist = trainDetails.some(
                (t) => Array.isArray(t.addons) && t.addons.length > 0,
              );
              const flightAddonsExist = flightsWithAddons.length > 0;
              const hasLegAddons = trainAddonsExist || flightAddonsExist;
              const flatAddons = selectedPackage?.addons || [];

              return (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 sm:p-8 mb-4 sm:mb-6 transition-all duration-500 hover:shadow-xl border border-indigo-100"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-indigo-800 flex items-center gap-2">
                      Traveller {index + 1}
                      {traveller.isCoTraveller && (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          Aadhaar OCR
                        </span>
                      )}
                    </h3>
                    {travellers.length > 1 && (
                      <button
                        onClick={() => removeTraveller(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Remove Traveller
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mb-4 sm:mb-6">
                    <select
                      className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                      value={
                        traveller.packageType === "main"
                          ? "main"
                          : traveller.variantPackageIndex
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "main") {
                          handleTravellerChange(index, "packageType", "main");
                          handleTravellerChange(index, "variantPackageIndex", null);
                        } else {
                          handleTravellerChange(index, "packageType", "variant");
                          handleTravellerChange(index, "variantPackageIndex", Number(value));
                        }
                      }}
                    >
                      <option value="main">Main Package</option>
                      {tourInfo.variantPackage?.map((pkg, i) => (
                        <option key={i} value={i}>
                          Variant {i + 1} ({pkg.destination?.join(", ")})
                        </option>
                      ))}
                    </select>

                    <select
                      value={traveller.title}
                      onChange={(e) => handleTravellerChange(index, "title", e.target.value)}
                      className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                    >
                      <option>Mr</option>
                      <option>Mrs</option>
                      <option>Ms</option>
                    </select>

                    <input
                      type="text"
                      placeholder="First Name (As per Aadhar)"
                      className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                      value={traveller.firstName}
                      onChange={(e) => handleTravellerChange(index, "firstName", e.target.value)}
                    />

                    <input
                      type="text"
                      placeholder="Last Name (As per Aadhar)"
                      className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                      value={traveller.lastName}
                      onChange={(e) => handleTravellerChange(index, "lastName", e.target.value)}
                    />

                    <input
                      type="number"
                      placeholder="Age"
                      className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                      value={traveller.age}
                      onChange={(e) => handleTravellerChange(index, "age", e.target.value)}
                    />

                    <select
                      value={traveller.gender}
                      onChange={(e) => handleTravellerChange(index, "gender", e.target.value)}
                      className="px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                    >
                      <option value="">Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-4 sm:mb-6">
                    <div>
                      <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                        Boarding Point
                      </label>
                      <select
                        className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                        value={getPointId(traveller.boardingPoint)}
                        onChange={(e) => {
                          const pkg =
                            traveller.packageType === "main"
                              ? tourInfo
                              : tourInfo.variantPackage?.[traveller.variantPackageIndex];
                          const selectedBP = pkg?.boardingPoints?.find(
                            (bp) => getPointId(bp) === e.target.value,
                          );
                          handleTravellerChange(index, "boardingPoint", selectedBP || null);
                        }}
                      >
                        <option value="">Select Boarding Point</option>
                        {(traveller.packageType === "main"
                          ? tourInfo.boardingPoints
                          : tourInfo.variantPackage?.[traveller.variantPackageIndex]
                              ?.boardingPoints || []
                        )?.map((bp, i) => (
                          <option key={getPointId(bp) || i} value={getPointId(bp)}>
                            {bp.stationCode} - {bp.stationName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                        Deboarding Point
                      </label>
                      <select
                        className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                        value={getPointId(traveller.deboardingPoint)}
                        onChange={(e) => {
                          const pkg =
                            traveller.packageType === "main"
                              ? tourInfo
                              : tourInfo.variantPackage?.[traveller.variantPackageIndex];
                          const selectedDP = pkg?.deboardingPoints?.find(
                            (dp) => getPointId(dp) === e.target.value,
                          );
                          handleTravellerChange(index, "deboardingPoint", selectedDP || null);
                        }}
                      >
                        <option value="">Select Deboarding Point</option>
                        {(traveller.packageType === "main"
                          ? tourInfo.deboardingPoints
                          : tourInfo.variantPackage?.[traveller.variantPackageIndex]
                              ?.deboardingPoints || []
                        )?.map((dp, i) => (
                          <option key={getPointId(dp) || i} value={getPointId(dp)}>
                            {dp.stationCode} - {dp.stationName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-6">
                    <div>
                      <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                        Sharing Type
                      </label>
                      <select
                        value={traveller.sharingType}
                        onChange={(e) => handleTravellerChange(index, "sharingType", e.target.value)}
                        className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                      >
                        <option value="">Select Sharing</option>
                        {Number(traveller.age) >= 11 ? (
                          <>
                            <option value="double">Double Sharing</option>
                            <option value="triple">Triple Sharing</option>
                          </>
                        ) : Number(traveller.age) >= 6 && Number(traveller.age) <= 10 ? (
                          <>
                            <option value="withBerth">Child with Berth</option>
                            <option value="withoutBerth">Child without Berth</option>
                          </>
                        ) : null}
                      </select>
                    </div>

                    {!hasLegAddons && flatAddons.length > 0 && (
                      <div>
                        <label className="block font-medium text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                          Add-ons (Optional)
                        </label>
                        <select
                          className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                          value={getSelectedFlatAddonId(traveller, flatAddons)}
                          onChange={(e) => handleFlatAddonSelect(index, e.target.value, flatAddons)}
                        >
                          <option value="">No Add-on</option>
                          {flatAddons.map((addon) => (
                            <option key={addon._id || addon.id} value={addon._id || addon.id}>
                              {addon.name} (+{currencySymbol}{addon.amount || 0})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {hasLegAddons && (
                    <>
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-lg">
                                🚆
                              </div>
                              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                                TRAIN WISE ADD-ONS
                              </h3>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Select add-ons for each trip
                            </p>
                          </div>
                          <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
                            <span className="text-sm font-semibold text-gray-600">TOTAL ADD ONS:</span>
                            <span className="ml-2 text-base font-bold text-indigo-700">
                              {currencySymbol}
                              {(traveller.selectedAddons || []).reduce(
                                (total, addon) => total + (Number(addon.amount) || 0),
                                0,
                              )}
                            </span>
                          </div>
                        </div>

                        {trainDetails.length > 0 ? (
                          <div className="space-y-3">
                            {trainDetails.map((train, trainIndex) => {
                              const trainAddons = train.addons || [];
                              return (
                                <div
                                  key={train._id || trainIndex}
                                  className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white hover:border-indigo-200 transition-all"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_300px] gap-4 items-center">
                                    <div className="flex md:justify-center">
                                      <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                        {String(trainIndex + 1).padStart(2, "0")}
                                      </div>
                                    </div>
                                    <div>
                                      {train.tripType && (
                                        <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase">
                                          {train.tripType}
                                        </span>
                                      )}
                                      <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                                        {train.trainName}{" "}
                                        <span className="text-gray-500 font-medium">({train.trainNo})</span>
                                      </h4>
                                      <p className="text-sm text-gray-500 mt-1">
                                        {train.fromStation}
                                        <span className="mx-2 text-gray-400">→</span>
                                        {train.toStation}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Add-on
                                      </label>
                                      <select
                                        className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all"
                                        value={getSelectedAddonForTrain(traveller, trainIndex)}
                                        onChange={(e) => handleAddonChange(index, trainIndex, e.target.value)}
                                      >
                                        <option value="">No Add-on</option>
                                        {trainAddons.map((addon) => (
                                          <option key={addon._id || addon.id} value={addon._id || addon.id}>
                                            {addon.name} ({currencySymbol}{addon.amount || 0})
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 rounded-xl p-5 text-center">
                            <p className="text-sm text-gray-500">No train / trip details available.</p>
                          </div>
                        )}
                      </div>

                      {flightsWithAddons.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 text-lg">
                              ✈️
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                              FLIGHT WISE ADD-ONS
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {flightsWithAddons.map(({ flight, flightIndexInPackage }) => (
                              <div
                                key={flight._id || flightIndexInPackage}
                                className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-white hover:border-purple-200 transition-all"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_300px] gap-4 items-center">
                                  <div className="flex md:justify-center">
                                    <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                                      {String(flightIndexInPackage + 1).padStart(2, "0")}
                                    </div>
                                  </div>
                                  <div>
                                    {flight.tripType && (
                                      <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold uppercase">
                                        {flight.tripType}
                                      </span>
                                    )}
                                    <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                                      {flight.airline}{" "}
                                      <span className="text-gray-500 font-medium">({flight.flightNo})</span>
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {flight.fromAirport}
                                      <span className="mx-2 text-gray-400">→</span>
                                      {flight.toAirport}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                      Add-on
                                    </label>
                                    <select
                                      className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all"
                                      value={getSelectedAddonForFlight(traveller, flightIndexInPackage)}
                                      onChange={(e) =>
                                        handleFlightAddonChange(index, flightIndexInPackage, e.target.value)
                                      }
                                    >
                                      <option value="">No Add-on</option>
                                      {(flight.addons || []).map((addon) => (
                                        <option key={addon._id || addon.id} value={addon._id || addon.id}>
                                          {addon.name} ({currencySymbol}{addon.amount || 0})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <textarea
                    className="w-full mt-6 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 resize-none"
                    rows="3"
                    placeholder="Remarks (optional)"
                    value={traveller.remarks}
                    onChange={(e) => handleTravellerChange(index, "remarks", e.target.value)}
                  />
                </div>
              );
            })}

            <button
              onClick={addTraveller}
              className="bg-indigo-100 text-indigo-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium hover:bg-indigo-200 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto"
            >
              + Add Another Traveller
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              Booking Summary
            </h3>
            <div className="space-y-3 sm:space-y-5 text-base sm:text-lg text-gray-700">
              <div className="flex justify-between">
                <span>Advance Amount:</span>
                <strong className="text-indigo-700">{currencySymbol}{amounts.advance}/-</strong>
              </div>
              <div className="flex justify-between">
                <span>Balance Amount:</span>
                <strong className="text-indigo-700">{currencySymbol}{amounts.balance}/-</strong>
              </div>
              <div className="flex justify-between">
                <span>Add-ons Total:</span>
                <strong className="text-indigo-700">{currencySymbol}{amounts.addonsTotal}/-</strong>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-xl sm:text-2xl font-bold text-gray-800 pt-2 sm:pt-3">
                <span>Total Payable:</span>
                <span className="text-indigo-800">{currencySymbol}{amounts.advance + amounts.balance}/-</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToTrollyClick}
            disabled={isSubmitting || confirmOpen}
            className={`w-full py-4 sm:py-5 rounded-2xl text-white font-bold text-lg sm:text-xl transition-all duration-500 transform hover:scale-[1.02] shadow-xl ${
              isSubmitting || confirmOpen ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } ${isSubmitting || confirmOpen ? "" : "hover:shadow-2xl"}`}
          >
            {isSubmitting && undoSecondsLeft === 0 ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 sm:h-6 w-5 sm:w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Adding to Trolly...
              </span>
            ) : (
              "Add to Trolly"
            )}
          </button>
        </div>
      </div>
    </div>

      {/* Step 1 of 2 — confirm before anything is sent. Fixed + centered via
          plain CSS (fixed inset-0 + flex center), same pattern as the
          "Confirm Navigation" modal in AllTourBookings.jsx — no body
          scroll-lock, so the page behind can still scroll but this popup
          never moves with it. */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Confirm this booking?
            </h3>
            <p className="text-gray-600 mb-5">
              {travellers.length} traveller{travellers.length > 1 ? "s" : ""} ·{" "}
              Total Payable:{" "}
              <strong className="text-indigo-700">
                {currencySymbol}{amounts.advance + amounts.balance}/-
              </strong>
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-5 py-3 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={startUndoWindow}
                className="px-5 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 of 2 — the cancellable countdown. The booking has NOT been
          sent to the server yet at this point (see startUndoWindow/
          handleAddToTrolly above), so Cancel here is a genuine abort, not
          an undo of something already saved. */}
      {isSubmitting && undoSecondsLeft > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center">
            <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
              Creating booking in {undoSecondsLeft}s...
            </h3>
            <p className="text-gray-500 mb-5 text-sm sm:text-base">
              Spotted a mistake? Cancel now — nothing has been saved yet.
            </p>
            <button
              onClick={cancelUndoWindow}
              className="px-6 py-3 rounded-xl font-bold text-red-600 border-2 border-red-300 hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateBooking;
