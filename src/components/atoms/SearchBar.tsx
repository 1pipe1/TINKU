import { Search, X } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
};

const SearchBar = ({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = "Buscar producto...",
  className = "",
}: SearchBarProps) => {
  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-10 py-2.5 sm:py-3 text-base md:text-lg text-slate-900 placeholder:text-slate-400 font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:shadow-md transition-all shadow-2xs"
      />
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="Borrar búsqueda"
          aria-label="Borrar búsqueda"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
