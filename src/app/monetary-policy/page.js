import Dashboard from "../components/dashboards/MonetaryDashboard";

export default function MonetaryPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex items-center justify-center text-center mt-10">
                <br/>
                <h1 className="text-2xl font-bold text-blue-600">
                Have you noticed how interest rates seem to influence everything, including your paycheck?
                </h1>
            </div>

            <div className="flex items-center justify-center mt-4">
                <p className="text-lg text-gray-700 max-w-2xl">
                <br/>
                This query examines the relationship between the Federal Funds Rate (the interest rate set by the Federal Reserve) and income trends across different sectors. It asks:
                </p>
            </div>

            <div className="flex items-center justify-center mt-6">
                <ul className="list-disc text-left text-gray-700 max-w-2xl text-lg">
                    <li className="mb-2">How do changes in interest rates impact income levels?</li>
                    <li className="mb-2">Are some income groups more affected than others?</li>
                </ul>
            </div>

            <div className="flex items-center justify-center mt-6">
                <p className="text-lg text-gray-700 max-w-2xl">
                    <b>What’s the process?</b> <br/>
                    We’ll align changes in the Federal Funds Rate with average income data for each group. By looking at year-over-year trends, we can see how shifts in interest rates ripple through the economy, influencing wages and income levels in different sectors.
					This can provide insights into how monetary policy affects your take-home pay.
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