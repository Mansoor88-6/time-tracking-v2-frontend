export default function AppLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-50">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-t-4 border-gray-300 dark:border-gray-600 rounded-full"></div>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          App is Loading...
        </p>
      </div>
    </div>
  );
}
