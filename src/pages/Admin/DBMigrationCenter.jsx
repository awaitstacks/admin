import { useContext, useState } from "react";
import { TourAdminContext } from "../../context/TourAdminContext";
import { toast, ToastContainer } from "react-toastify";
import { Loader2, AlertTriangle, Database, Lock } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

// ── BOTH MIGRATIONS ARE TEMPORARILY DISABLED ───────────────────────────
// A previous run of "Add Missing Fields" overwrote emergencyContact,
// termsAgreed, and termsAgreedAt on bookings that already had valid,
// user-submitted values — because the original migration used a single
// $or-matched updateMany that unconditionally $set ALL fields on every
// matched document, instead of checking each field's existence
// independently. Both buttons are disabled here until:
//   1. Data recovery (from an Atlas backup snapshot, if available) is
//      confirmed complete or confirmed impossible, AND
//   2. The migration endpoint itself has been fixed server-side to use
//      independent per-field updateMany calls (matching the safer
//      pattern already used for gvCancellationPool/irctcCancellationPool).
// Flip MIGRATIONS_DISABLED back to false only after both conditions are
// met and a fresh backup has been taken.
const MIGRATIONS_DISABLED = true;

const DBMigrationCenter = () => {
  const { addMissingFields, generateMissingTNRs } =
    useContext(TourAdminContext);

  const [loadingFields, setLoadingFields] = useState(false);
  const [loadingTNR, setLoadingTNR] = useState(false);
  const [showConfirmFields, setShowConfirmFields] = useState(false);
  const [showConfirmTNR, setShowConfirmTNR] = useState(false);

  // ─── Add Missing Fields Migration ─────────────────────────────────────
  const handleRunFieldsMigration = () => {
    if (MIGRATIONS_DISABLED) return;
    setShowConfirmFields(true);
  };

  const confirmAndRunFields = async () => {
    setShowConfirmFields(false);
    setLoadingFields(true);

    try {
      const result = await addMissingFields();

      toast.success(
        `Migration complete! Updated ${result.data.modifiedCount} booking(s).`,
        {
          containerId: "migration-toast",
          position: "top-right",
          autoClose: 6000,
        },
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Migration failed. Please try again.";
      toast.error(msg, {
        containerId: "migration-toast",
        position: "top-right",
        autoClose: 8000,
      });
    } finally {
      setLoadingFields(false);
    }
  };

  // ─── Generate Missing TNRs ────────────────────────────────────────────
  const handleGenerateTNRs = () => {
    if (MIGRATIONS_DISABLED) return;
    setShowConfirmTNR(true);
  };

  const confirmAndGenerateTNRs = async () => {
    setShowConfirmTNR(false);
    setLoadingTNR(true);

    try {
      const result = await generateMissingTNRs();

      const {
        totalMissing = 0,
        successfullyUpdated = 0,
        failed = 0,
      } = result.summary || {};

      toast.success(
        `TNR Generation complete!\nUpdated: ${successfullyUpdated}/${totalMissing}${
          failed > 0 ? ` | Failed: ${failed}` : ""
        }`,
        {
          containerId: "migration-toast",
          position: "top-right",
          autoClose: 8000,
        },
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "TNR generation failed. Please try again.";
      toast.error(msg, {
        containerId: "migration-toast",
        position: "top-right",
        autoClose: 8000,
      });
    } finally {
      setLoadingTNR(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-md md:max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Toast Container */}
          <div className="absolute top-4 right-4 z-50 pointer-events-none">
            <ToastContainer
              containerId="migration-toast"
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              theme="colored"
              limit={2}
            />
          </div>

          <div className="p-8 md:p-12 text-center">
            {/* Header */}
            <div className="mb-10">
              <div className="mx-auto w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <Database className="w-14 h-14 text-amber-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Database Migration Center
              </h2>
              <p className="text-red-600 font-bold text-xl mt-2">
                DANGER ZONE — USE WITH CAUTION
              </p>
            </div>

            {/* Disabled Notice Banner */}
            {MIGRATIONS_DISABLED && (
              <div className="bg-gray-800 border-2 border-gray-900 rounded-xl p-6 mb-6 text-left flex items-start gap-4">
                <Lock className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-bold text-lg">
                    Migrations temporarily disabled
                  </p>
                  <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                    A previous migration run overwrote valid data on existing
                    bookings. Both actions below are locked until data
                    recovery is confirmed and the migration logic is fixed.
                  </p>
                </div>
              </div>
            )}

            {/* Warning Banner */}
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-10 text-left">
              <p className="text-base text-gray-800 leading-relaxed">
                These actions will modify <strong>ALL tour bookings</strong> in
                the database.
              </p>
              <p className="text-sm text-red-700 font-bold mt-3">
                Both operations are irreversible without backup.
              </p>
            </div>

            {/* Two Migration Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Button 1: Add Missing Fields */}
              <button
                onClick={handleRunFieldsMigration}
                disabled={MIGRATIONS_DISABLED || loadingFields || loadingTNR}
                title={MIGRATIONS_DISABLED ? "Disabled — see notice above" : undefined}
                className={`
                  flex flex-col items-center justify-center gap-4 p-8 
                  rounded-xl font-bold text-lg text-white shadow-xl
                  transition-all duration-200 transform
                  ${
                    MIGRATIONS_DISABLED
                      ? "bg-gray-400 cursor-not-allowed opacity-60"
                      : loadingFields || loadingTNR
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 active:bg-red-800 hover:scale-105"
                  }
                `}
              >
                {loadingFields ? (
                  <>
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <span>Running Fields Migration...</span>
                  </>
                ) : MIGRATIONS_DISABLED ? (
                  <>
                    <Lock className="w-10 h-10" />
                    <span>Add Missing Fields (Disabled)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-10 h-10" />
                    <span>Add Missing Fields</span>
                  </>
                )}
              </button>

              {/* Button 2: Generate Missing TNRs */}
              <button
                onClick={handleGenerateTNRs}
                disabled={MIGRATIONS_DISABLED || loadingFields || loadingTNR}
                title={MIGRATIONS_DISABLED ? "Disabled — see notice above" : undefined}
                className={`
                  flex flex-col items-center justify-center gap-4 p-8 
                  rounded-xl font-bold text-lg text-white shadow-xl
                  transition-all duration-200 transform
                  ${
                    MIGRATIONS_DISABLED
                      ? "bg-gray-400 cursor-not-allowed opacity-60"
                      : loadingFields || loadingTNR
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 hover:scale-105"
                  }
                `}
              >
                {loadingTNR ? (
                  <>
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <span>Generating TNRs...</span>
                  </>
                ) : MIGRATIONS_DISABLED ? (
                  <>
                    <Lock className="w-10 h-10" />
                    <span>Generate Missing TNRs (Disabled)</span>
                  </>
                ) : (
                  <>
                    <Database className="w-10 h-10" />
                    <span>Generate Missing TNRs</span>
                  </>
                )}
              </button>
            </div>

            <p className="mt-10 text-sm font-extrabold text-red-700 uppercase tracking-widest">
              Only execute if you have confirmed backup & authorization
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal - Add Missing Fields */}
      {showConfirmFields && !MIGRATIONS_DISABLED && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-16 h-16 text-red-600 animate-pulse" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Confirm Missing Fields Migration
              </h3>
              <p className="text-gray-600 text-base mb-8 leading-relaxed">
                This will add default values to missing fields in{" "}
                <strong>ALL tour bookings</strong>.
                <br />
                <span className="text-red-600 font-bold block mt-3">
                  This action is irreversible.
                </span>
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmFields(false)}
                  className="flex-1 px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAndRunFields}
                  disabled={loadingFields}
                  className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-3 text-lg"
                >
                  {loadingFields ? (
                    <>
                      <Loader2 className="w-7 h-7 animate-spin" />
                      Running...
                    </>
                  ) : (
                    "Yes, Run Migration"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Generate TNRs */}
      {showConfirmTNR && !MIGRATIONS_DISABLED && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                <Database className="w-16 h-16 text-indigo-600 animate-pulse" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">
                Confirm TNR Generation
              </h3>
              <p className="text-gray-600 text-base mb-8 leading-relaxed">
                This will generate unique 6-digit TNRs for all bookings that are
                missing them.
                <br />
                <span className="text-indigo-600 font-bold block mt-3">
                  Safe to run multiple times — already assigned bookings are
                  skipped.
                </span>
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirmTNR(false)}
                  className="flex-1 px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAndGenerateTNRs}
                  disabled={loadingTNR}
                  className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-3 text-lg"
                >
                  {loadingTNR ? (
                    <>
                      <Loader2 className="w-7 h-7 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Yes, Generate TNRs"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DBMigrationCenter;
