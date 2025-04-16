export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-950 border-t border-slate-200 dark:border-slate-700 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Copyright &copy; {new Date().getFullYear()} 巽川·怀因 All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}