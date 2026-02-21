import './loader.css'

function Loader() {
  return (
    /* 
       - flex-1: para mo-expand sa available space
       - min-h-[calc(100vh-200px)]: i-calculate ang height (100vh minus header/footer height)
       - w-full: tibuok width sa outlet
    */
    <div className="flex flex-col items-center justify-center w-full min-h-[70vh] transition-all duration-300">
      <div className="relative flex items-center justify-center">
        <span className="loader"></span>
      </div>
      
      {/* Optional: Pwede nimo dugangan og gamay nga text sa ubos */}
      <p className="mt-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] animate-pulse">
        Loading Data...
      </p>
    </div>
  )
}

export default Loader