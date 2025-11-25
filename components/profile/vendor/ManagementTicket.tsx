"use client";

import React, { useState } from "react";
import { TicketDashboardTab } from "./TicketDashboardTab";
import TicketScanTab from "./TicketScanTab";
import { TicketSendInvitationTab } from "./TicketSendInvitationTab";

interface ManagementTicketProps {
  vendorDocumentId: string;
  jwtToken: string;
}

const ManagementTicket: React.FC<ManagementTicketProps> = ({ vendorDocumentId, jwtToken }) => {
  const tabs = [
    { key: "dashboard", label: "Dashboard Ticket" },
    { key: "scan", label: "Scan Ticket" },
    { key: "sendInvitation", label: "Kirim Undangan Tiket" },
  ];

  const [activeTab, setActiveTab] = useState<string>(tabs[0].key);

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <h3 className="text-2xl font-bold mb-6">Management Ticket</h3>
      <div className="border-b border-gray-300 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              aria-current={activeTab === tab.key ? "page" : undefined}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {activeTab === "dashboard" && (
          <TicketDashboardTab vendorDocumentId={vendorDocumentId} jwtToken={jwtToken} />
        )}
        {activeTab === "scan" && <TicketScanTab />}
        {activeTab === "sendInvitation" && <TicketSendInvitationTab vendorDocumentId={vendorDocumentId} jwtToken={jwtToken} />}
      </div>
    </div>
  );
};

export default ManagementTicket;
