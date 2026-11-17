const styles = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-200 text-gray-600",
  low: "bg-gray-100 text-gray-600",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700",
};

export default function Badge({ value }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${
        styles[value] || "bg-gray-100 text-gray-600"
      }`}
    >
      {value.replace("_", " ")}
    </span>
  );
}