import Dashboard from "../components/dashboards/InflationDashboard";

export default function InflationPage() {
    return (
        <div className="min-h-screen">
            <div className="flex items-center justify-center text-center mt-12">
                <br/>
                <h1 className="text-2xl text-blue-900 mb-12">
                Curious about how inflation impacts what your income is really worth?
                </h1>
            </div>
            <div className="flex mb-8 items-center justify-center">
            <div className="m-10 ml-20">
            <div className="flex items-center justify-center mt-4">
                <p className="text-lg text-gray-700 max-w-2xl">
                <br/>
                This query investigates how rising prices (inflation) erode the value of your income over time. It seeks to answer:
                </p>
            </div>

            <div className="flex items-center justify-center mt-6">
                <ul className="list-disc text-left font-light text-gray-700 max-w-2xl text-lg">
                    <li className="mb-2">How has purchasing power changed for different income groups?</li>
                    <li className="mb-2">Which groups are feeling the pinch of inflation the most?</li>
                </ul>
            </div>
            </div>
            <div className="items-center justify-center mt-10 mr-20">
                <p className="text-lg text-gray-700 max-w-2xl mb-2">
                    What’s the process?</p> <br/>
                    <p className="text-lg text-gray-700 font-light max-w-2xl">
                    By adjusting nominal income (the actual amount you earn) with CPI data, we calculate “real income,” which shows what your money can buy after accounting for inflation. We’ll track this across different income brackets to see how inflation impacts people at various income levels over time.
					This helps reveal whether lower or higher-income groups are losing more ground as inflation rises. 1 indicates the lowest income bracket, while 6 indicates the highest income bracket.
                </p>
            </div>
            </div>

            <div className="mt-10">
                <Dashboard />
            </div>

            <footer className="text-center mt-10 mb-6 text-gray-500">
                <p>&copy; 2024 Dollartrend. All rights reserved.</p>
            </footer>
        </div>
    );
}