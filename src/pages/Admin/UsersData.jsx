
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState, useRef } from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  Search as SearchIcon,
  X,
  ChevronDown
} from 'lucide-react';
import { TourAdminContext } from '../../context/TourAdminContext';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UsersData = () => {
  const { allUsers, getAllUsers, aToken } = useContext(TourAdminContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [genderOpen, setGenderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dropdownRef = useRef(null);

  // LEAVE CONFIRMATION PROTECTION
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "You have unsaved changes or active filters. Are you sure you want to leave?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    window.history.pushState(null, null, window.location.href);

    const handlePopState = (event) => {
      event.preventDefault();
      setShowLeaveConfirm(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Fetch users – show toast only on error
  useEffect(() => {
    if (aToken) {
      setIsLoading(true);

      getAllUsers()
        .catch((error) => {
          console.error("Error fetching users:", error);
          toast.error("Failed to load users");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [aToken, getAllUsers]);

  // Close gender dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setGenderOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = allUsers?.filter(user => {
    const matchesSearch = 
      !searchTerm ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender = genderFilter === 'all' || user.gender === genderFilter;
    const matchesPhone = 
      !phoneFilter ||
      user.phone?.toLowerCase().includes(phoneFilter.toLowerCase());

    return matchesSearch && matchesGender && matchesPhone;
  }) || [];

  const clearFilters = () => {
    setSearchTerm('');
    setGenderFilter('all');
    setPhoneFilter('');
  };

  const hasFilters = searchTerm || genderFilter !== 'all' || phoneFilter !== '';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto bg-gray-50 min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Header - Mobile: Logo + Title on 1st line, count+date on 2nd line */}
      <div className="mb-8 sm:mb-10">
        {/* Mobile view */}
        <div className="md:hidden flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-12 h-12 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              All Users
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            {allUsers?.length || 0} registered users • {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Desktop view - left aligned */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Users className="w-12 h-12 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
              <p className="text-gray-600 mt-1">
                {allUsers?.length || 0} registered users • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search by Name or Email</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </div>

          {/* Gender Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <div 
              onClick={() => setGenderOpen(!genderOpen)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer flex justify-between items-center bg-white hover:border-indigo-500"
            >
              <span>{genderFilter === 'all' ? 'All Genders' : genderFilter}</span>
              <ChevronDown className={`text-gray-500 transition-transform ${genderOpen ? 'rotate-180' : ''}`} size={18} />
            </div>

            {genderOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                {['all', 'Male', 'Female', 'Other', 'Not Selected'].map(opt => (
                  <div
                    key={opt}
                    onClick={() => {
                      setGenderFilter(opt);
                      setGenderOpen(false);
                    }}
                    className="px-4 py-2.5 hover:bg-indigo-50 cursor-pointer"
                  >
                    {opt === 'all' ? 'All Genders' : opt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <input
                type="text"
                value={phoneFilter}
                onChange={(e) => setPhoneFilter(e.target.value)}
                placeholder="Search phone number..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </div>

          {/* Clear button */}
          {hasFilters && (
            <div className="self-end">
              <button
                onClick={clearFilters}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition flex items-center justify-center gap-2"
              >
                <X size={16} /> Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 text-gray-600 text-lg">Loading users...</div>
      )}

      {/* Content */}
      {!isLoading && allUsers && (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider w-24">Photo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name & Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        {user.image && user.image.includes('http') ? (
                          <img
                            src={user.image}
                            alt={user.name || 'User'}
                            className="h-12 w-12 rounded-full object-cover border-2 border-indigo-100"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=6366f1&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                            {(user.name?.[0] || 'U').toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-medium text-gray-900">{user.name || '—'}</div>
                        <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                          <Mail size={14} /> {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-700">{user.phone || 'Not provided'}</td>
                      <td className="px-6 py-5 text-gray-700">{user.gender || 'Not selected'}</td>
                      <td className="px-6 py-5 text-gray-700">
                        {user.address?.line1 || user.address?.line2
                          ? `${user.address.line1 || ''} ${user.address.line2 || ''}`.trim()
                          : 'No address'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE VERTICAL CARDS */}
          <div className="md:hidden space-y-5">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No matching users</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
                >
                  {/* Header with photo + name/email */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 flex items-center gap-4">
                    {user.image && user.image.includes('http') ? (
                      <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className="h-14 w-14 rounded-full object-cover border-2 border-white shadow"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=6366f1&color=fff`;
                        }}
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl shadow">
                        {(user.name?.[0] || 'U').toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg truncate">
                        {user.name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5 truncate">
                        <Mail size={14} /> {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Details stacked vertically */}
                  <div className="p-4 space-y-3.5 text-sm divide-y divide-gray-100">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium">{user.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Gender</span>
                      <span className="font-medium">{user.gender || 'Not selected'}</span>
                    </div>
                    <div className="pt-3">
                      <span className="text-gray-600 block mb-1">Address</span>
                      <p className="text-gray-800 break-words">
                        {user.address?.line1 || user.address?.line2
                          ? `${user.address.line1 || ''} ${user.address.line2 || ''}`.trim()
                          : 'No address provided'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Leave Confirmation Popup */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Confirm Navigation
            </h2>
            <p className="text-gray-600 mb-6">
              You are about to leave this page.<br />
              Any active filters or changes will be lost on reload.<br /><br />
              Are you sure you want to continue?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  window.history.pushState(null, null, window.location.href);
                }}
                className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition"
              >
                Cancel (Stay)
              </button>
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  window.history.back();
                }}
                className="px-8 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
              >
                Yes (Leave)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersData;
