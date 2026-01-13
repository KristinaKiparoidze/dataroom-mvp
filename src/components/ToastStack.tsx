import { Toaster } from "react-hot-toast";

export function ToastContainer() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3800,
        style: {
          background: "#fff",
          color: "#333",
          borderRadius: "0.75rem",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
        success: {
          style: {
            background: "#f0fdf4",
            border: "1px solid #dcfce7",
            color: "#166534",
          },
        },
        error: {
          style: {
            background: "#fef2f2",
            border: "1px solid #fee2e2",
            color: "#b91c1c",
          },
        },
      }}
    />
  );
}
