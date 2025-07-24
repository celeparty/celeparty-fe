import { PaymentStatus } from "./interfaces/iOrder";

type StatusConfig = {
  text: string;
  bgColor: string;
  textColor: string;
  actions: Array<{
    label: string;
    action: "process" | "cancel" | "complete";
    variant: "default" | "destructive";
  }>;
};

const STATUS_CONFIG_MAP: Record<PaymentStatus, StatusConfig> = {
  pending: {
    text: "Pending",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    actions: [
      { label: "Process", action: "process", variant: "default" },
      { label: "Cancel", action: "cancel", variant: "destructive" },
    ],
  },
  processing: {
    text: "Processing",
    bgColor: "bg-gray-800",
    textColor: "text-white",
    actions: [
      { label: "Complete", action: "complete", variant: "default" },
      { label: "Cancel", action: "cancel", variant: "destructive" },
    ],
  },
  paid: {
    text: "Paid",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    actions: [],
  },
  cancelled: {
    text: "Cancelled",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    actions: [],
  },
};

export const getStatusConfig = (status: PaymentStatus): StatusConfig => {
  return (
    STATUS_CONFIG_MAP[status] || {
      text: "Unknown",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      actions: [],
    }
  );
};
