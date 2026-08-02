const DashboardLayout = ({ children }) => {
    return (
        <div className='min-h-screen bg-gray-50'>
            <header className='bg-white border-b border-gray-200 px-6 py-3'>
                <div className='max-w-5xl mx-auto flex items-center gap-2'>
                    <div className='w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white text-sm font-bold'>T</div>
                    <span className='font-semibold text-teal-900 text-sm'>Daily Tracker</span>
                </div>
            </header>
            <main className='px-6 py-6'>{children}</main>
        </div>
    );
};

export default DashboardLayout