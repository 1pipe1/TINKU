import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/useCartStore";
import useAuthStore from "../../store/useAuthStore";
import SearchBar from "../atoms/SearchBar";
import CartDropdown from "./CartDropdown";

type NavbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onCheckout: () => void;
};

const Navbar = ({ search, onSearchChange, onCheckout }: NavbarProps) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const role = user?.role ?? null;

  console.log("NAVBAR:", {
    isAuthenticated,
    role,
    user,
  });
  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-3 md:px-8 py-4 flex items-center justify-between gap-4">
        <h1 className="text-lg md:text-2xl font-bold text-[#0F172A] whitespace-nowrap">
          TINKU
        </h1>

        <div className="flex-1 flex justify-center items-center max-w-md">
          <SearchBar value={search} onChange={onSearchChange} />
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              <span className="font-bold text-black">MiNegocio</span>
            </button>
          )}

          <div
            className="relative cursor-pointer"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-6 h-6 text-[#0F172A]" />
            {getTotalItems() > 0 && (
              <span
                style={{ backgroundColor: "#EA580C" }}
                className="absolute -top-2 -right-2 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
              >
                {getTotalItems()}
              </span>
            )}
          </div>
        </div>
      </nav>

      <CartDropdown
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={onCheckout}
      />
    </>
  );
};

export default Navbar;
