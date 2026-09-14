import { AnimatePresence, motion } from "framer-motion";

export default function LogoutPopup({
  isOpen,
  onClose,
  onConfirm,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          className="absolute right-0 top-full z-50 w-64 rounded-xl border border-white/10 bg-[#222B33] p-4 shadow-2xl"
        >
          

          <h3 className="text-sm font-semibold text-white">
            Logout
          </h3>

          <p className="mt-2 text-xs text-gray-300">
            Are you sure you want to logout?
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="rounded-lg bg-[#F6B94C] px-3 py-2 text-sm font-medium text-black transition hover:brightness-95"
            >
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}