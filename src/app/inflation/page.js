import Dashboard from "../components/dashboards/InflationDashboard";

export default function InflationPage() {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex items-center justify-center text-center mt-10">
                <br/>
                <h1 className="text-2xl font-bold text-blue-600">
                Curious about how inflation impacts what your income is really worth?
                </h1>
            </div>

            <div className="flex items-center justify-center mt-4">
                <p className="text-lg text-gray-700 max-w-2xl">
                <br/>
                This query investigates how rising prices (inflation) erode the value of your income over time. It seeks to answer:
                </p>
            </div>

            <div className="flex items-center justify-center mt-6">
                <ul className="list-disc text-left text-gray-700 max-w-2xl text-lg">
                    <li className="mb-2">How has purchasing power changed for different income groups?</li>
                    <li className="mb-2">Which groups are feeling the pinch of inflation the most?</li>
                </ul>
            </div>

            <div className="flex items-center justify-center mt-6">
                <p className="text-lg text-gray-700 max-w-2xl">
                    <b>What’s the process?</b> <br/>
                    By adjusting nominal income (the actual amount you earn) with CPI data, we calculate “real income,” which shows what your money can buy after accounting for inflation. We’ll track this across different income brackets to see how inflation impacts people at various income levels over time.
					This helps reveal whether lower or higher-income groups are losing more ground as inflation rises.
                </p>
            </div>

            <div className="mt-10">
                <Dashboard />
            </div>

            <footer className="text-center mt-10 text-gray-500">
                <p>&copy; 2024 DollarTrend. All rights reserved.</p>
            </footer>
        </div>
    );
}