import { useSearchParams } from "react-router-dom";

export default function Pagination({ currentPage, totalPages }) {
  const [searchParams, setSearchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  // Modern Windowing Logic
  const getPageNumbers = () => {
    const maxVisible = 4;
    let start = Math.max(1, currentPage - 1);
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return { pages, showStartEllipsis: start > 1, showEndEllipsis: end < totalPages };
  };

  const { pages, showStartEllipsis, showEndEllipsis } = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-4 sm:py-6 px-3 sm:px-4 bg-white border-t border-slate-100 mt-4 sm:mt-6 select-none">
      
      {/* Left Text Counter */}
      <p className="text-xs sm:text-sm font-medium text-slate-500 text-center sm:text-left">
        Showing page <span className="font-bold text-slate-900">{currentPage}</span> of{" "}
        <span className="font-bold text-slate-900">{totalPages}</span>
      </p>

      {/* Main Pagination Controls */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 max-w-full flex-wrap">

        {/* Previous Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => changePage(currentPage - 1)}
          className="cursor-pointer flex items-center justify-center h-8 px-2.5 sm:h-9 sm:px-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium"
        >
          ‹ Prev
        </button>

        {/* First Page + Ellipsis (Hidden on extra small mobile screens) */}
        {showStartEllipsis && (
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => changePage(1)}
              className="cursor-pointer w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm transition-all"
            >
              1
            </button>
            <span className="px-0.5 text-slate-400 font-bold text-xs sm:text-sm">...</span>
          </div>
        )}

        {/* Dynamic Page Numbers */}
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => changePage(page)}
              className={`cursor-pointer w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200 border border-amber-500 scale-105"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Ellipsis + Last Page (Hidden on extra small mobile screens) */}
        {showEndEllipsis && (
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="px-0.5 text-slate-400 font-bold text-xs sm:text-sm">...</span>
            <button
              onClick={() => changePage(totalPages)}
              className="cursor-pointer w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm transition-all"
            >
              {totalPages}
            </button>
          </div>
        )}

        {/* Next Button */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => changePage(currentPage + 1)}
          className="cursor-pointer flex items-center justify-center h-8 px-2.5 sm:h-9 sm:px-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}