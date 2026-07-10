export default function FeedLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col pb-12">
      {/* Header Skeleton */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-200 animate-pulse" />
          <div className="w-16 h-5 bg-zinc-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-8 bg-zinc-200 rounded-xl animate-pulse" />
          <div className="w-20 h-8 bg-zinc-200 rounded-xl animate-pulse" />
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex-1">
        
        {/* Banner Skeleton */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2.5 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <div className="w-24 h-4.5 bg-zinc-200 rounded-full animate-pulse" />
              <div className="w-32 h-4.5 bg-zinc-200 rounded-full animate-pulse" />
            </div>
            <div className="w-72 h-7 bg-zinc-200 rounded-xl animate-pulse" />
            <div className="w-56 h-4 bg-zinc-200 rounded-lg animate-pulse" />
          </div>
          <div className="w-full md:w-80 h-10 bg-zinc-100 border border-zinc-200 rounded-xl animate-pulse" />
        </div>

        {/* Listings Grid Skeleton (6 items) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              {/* Silhouette Area Skeleton */}
              <div className="bg-zinc-50 border-b border-zinc-100 p-6 h-40 flex items-center justify-center relative animate-pulse">
                <div className="w-4/5 h-20 bg-zinc-200/60 rounded-2xl" />
                <div className="absolute top-3 right-3 w-12 h-4.5 bg-white border border-zinc-200 rounded-full" />
              </div>
              
              {/* Info Area Skeleton */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-3/4 h-5.5 bg-zinc-200 rounded-lg animate-pulse" />
                  <div className="w-12 h-3.5 bg-zinc-200 rounded-md animate-pulse" />
                  
                  <div className="pt-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-200 animate-pulse" />
                    <div className="w-28 h-3.5 bg-zinc-200 rounded-md animate-pulse" />
                  </div>
                </div>

                <div className="border-t border-zinc-150 pt-4 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="w-10 h-3 bg-zinc-250 rounded animate-pulse" />
                    <div className="w-16 h-5.5 bg-zinc-200 rounded-lg animate-pulse" />
                  </div>
                  <div className="w-24 h-9 bg-zinc-200 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
