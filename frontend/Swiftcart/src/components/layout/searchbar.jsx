import { FiSearch } from "react-icons/fi";

export default function SearchBar() {
  return (
    <div className="hidden lg:flex flex-1 max-w-4xl mx-8">
  <div className="group flex items-center w-full h-14 rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-violet-400 focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-100">

    {/* Icon Container */}
    <div className="flex items-center justify-center w-14 h-full">
      <FiSearch className="text-[22px] text-gray-500" />
    </div>

    {/* Input */}
    <input
      type="text"
      placeholder='Search for "cheese slices"'
      className="flex-1 h-full pr-5 bg-transparent text-[16px] text-gray-800 placeholder:text-gray-500 outline-none"
    />

  </div>
</div>
  );
}