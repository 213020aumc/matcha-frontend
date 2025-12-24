import { Loader2 } from "lucide-react"; // Import spinner icon

export const Button = ({
  children,
  variant = "primary",
  isLoading,
  className = "",
  ...props
}) => {
  const baseStyle =
    "flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    // Uses the variables defined in src/index.css
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary:
      "bg-white text-secondary border border-gray-300 hover:bg-secondary-hover",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};
