type ButtonProps = {
  text: string;
  onClick: () => void;
};

const Button = ({ text, onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: "#EA580C" }}
      className="hover:opacity-90 text-white font-bold text-base min-h-11 py-2 px-5 rounded-lg transition-colors"
    >
      {text}
    </button>
  );
};

export default Button;
