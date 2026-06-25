import './loader.css'

function Loader() {
  return (
    /* 
       - flex-1: para mo-expand sa available space
       - min-h-[calc(100vh-200px)]: i-calculate ang height (100vh minus header/footer height)
       - w-full: tibuok width sa outlet
    */
    <div className="flex flex-col items-center justify-center w-full min-h-[70vh] transition-all duration-300">
      <div className="rounded-[2rem] border border-white/70 dark:border-slate-700/80 bg-white/85 dark:bg-slate-950/85 px-10 py-8 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 backdrop-blur-md flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          <span className="loader"></span>
        </div>

        <p className="mt-4 text-[10px] font-black text-primary dark:text-emerald-300 uppercase tracking-[0.3em] animate-pulse drop-shadow-sm">
          Loading Data...
        </p>
      </div>
    </div>
  )
}

export default Loader
