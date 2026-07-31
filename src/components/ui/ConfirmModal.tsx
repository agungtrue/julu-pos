import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "danger",
  isLoading = false,
}) => {
  // 💡 Close modal saat tekan tombol ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // Variant Styling
  const variantStyles = {
    danger: {
      iconBg: "bg-red-50 text-red-500",
      buttonBg: "bg-red-500 hover:bg-red-600 text-white",
    },
    warning: {
      iconBg: "bg-amber-50 text-amber-500",
      buttonBg: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    info: {
      iconBg: "bg-[#0F766E]/10 text-[#0F766E]",
      buttonBg: "bg-[#0F766E] hover:bg-[#0b5953] text-white",
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      {/* BACKDROP CLICK TO CLOSE */}
      <div
        className="fixed inset-0"
        onClick={() => !isLoading && onClose()}
      />

      {/* MODAL CARD */}
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform transition-all relative z-10 p-6 animate-scale-up">
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ICON & CONTENT */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className={`p-3.5 rounded-2xl ${variantStyles.iconBg}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-gray-800 text-base">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2.5 mt-6 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${variantStyles.buttonBg} disabled:opacity-50`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};