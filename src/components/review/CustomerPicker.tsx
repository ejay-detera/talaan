"use client";

import React, { useState } from "react";
import { User, UserPlus } from "lucide-react";

interface CustomerOption {
  id: string;
  name: string;
}

interface CustomerPickerProps {
  customerId?: string | null;
  newCustomerName?: string | null;
  customerCandidates: CustomerOption[];
  onSelectCustomer: (customerId: string | null, newCustomerName: string | null) => void;
  className?: string;
}

export function CustomerPicker({
  customerId,
  newCustomerName,
  customerCandidates,
  onSelectCustomer,
  className = "",
}: CustomerPickerProps) {
  const [isCreatingNew, setIsCreatingNew] = useState(Boolean(newCustomerName));

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__new__") {
      setIsCreatingNew(true);
      onSelectCustomer(null, "");
    } else {
      setIsCreatingNew(false);
      onSelectCustomer(val || null, null);
    }
  };

  const handleNewNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectCustomer(null, e.target.value);
  };

  if (isCreatingNew) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <UserPlus className="w-4 h-4 text-ink flex-shrink-0" />
        <input
          type="text"
          value={newCustomerName || ""}
          onChange={handleNewNameChange}
          placeholder="Bagong customer..."
          className="h-[44px] px-2.5 text-xs font-semibold rounded-row border border-rule bg-sheet text-pencil focus:outline-none focus:ring-2 focus:ring-ink w-full"
          aria-label="Pangalan ng bagong customer"
        />
        <button
          type="button"
          onClick={() => {
            setIsCreatingNew(false);
            onSelectCustomer(null, null);
          }}
          className="text-[11px] text-muted hover:text-pencil px-1.5 py-1 whitespace-nowrap cursor-pointer"
        >
          Pumili sa listahan
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <User className="w-4 h-4 text-muted flex-shrink-0" />
      <select
        value={customerId || ""}
        onChange={handleSelectChange}
        className="h-[44px] px-2 text-xs font-semibold rounded-row border border-rule bg-sheet text-pencil focus:outline-none focus:ring-2 focus:ring-ink w-full cursor-pointer"
        aria-label="Pumili ng customer"
      >
        <option value="">-- Walang customer --</option>
        {customerCandidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
        <option value="__new__">+ Gumawa ng Bagong Customer...</option>
      </select>
    </div>
  );
}
