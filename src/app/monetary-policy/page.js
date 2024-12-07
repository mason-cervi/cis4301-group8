import Dashboard from "../components/dashboards/MonetaryDashboard";

export default function MonetaryPolicyPage() {
    return (
        <div className="min-h-screen">
            <div className="flex items-center justify-center text-center mt-12">
                <br/>
                <h1 className="text-2xl text-blue-900 mb-12">
                Have you noticed how interest rates seem to influence everything, including your paycheck?
                </h1>
            </div>
            <div className="flex mb-8 items-center justify-center">
            <div className="m-10 ml-20">
            <div className="flex items-center justify-center">
                <p className="text-lg text-gray-700 max-w-2xl">
                <br/>
                This query examines the relationship between the Federal Funds Rate (the interest rate set by the Federal Reserve) and income trends across different sectors. It asks:
                </p>
            </div>

            <div className="flex items-center justify-center mt-6">
                <ul className="list-disc text-left font-light text-gray-700 max-w-2xl text-lg">
                    <li className="mb-2">How do changes in interest rates impact income levels?</li>
                    <li className="mb-2">Do changes in interest rates influence tax credits?</li>
                </ul>
            </div>
            </div>
            <div className="items-center justify-center mt-10 mr-20">
                <p className="text-lg text-gray-700 max-w-2xl mb-2">
                    What’s the process?</p> <br/>
                    <p className="text-lg text-gray-700 font-light max-w-2xl">
                    We’ll align changes in the Federal Funds Rate with average nominal income and average tax credits. By looking at year-over-year trends, we can see how shifts in interest rates ripple through the economy, influencing income levels and income distribution of a state.
					This can provide insights into how monetary policy affects your take-home pay.
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