"use client";

import { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-card"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <button
          className="modal-close"
          onClick={onClose}
        >
          ×
        </button>

        <h2>{title}</h2>

        {children}
      </div>
    </div>
  );
}