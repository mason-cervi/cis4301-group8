import Dashboard from "../components/dashboards/IncomeDataDashboard";

export default function IncomeDataPage() {
    return (
        <div className="min-h-screen">
            <div className="flex items-center justify-center text-center mt-12">
                <br/>
                <h1 className="text-2xl text-blue-900 mb-12">
                Ever wondered how income inequality looks in your state compared to others?
                </h1>
            </div>
            <div className="flex mb-8 items-center justify-center">
            <div className="m-10 ml-20">
            <div className="flex items-center justify-center">
                <p className="text-lg text-gray-700 max-w-2xl">
                <br/>
                This query explores changes in income distribution across different income brackets and states over time. It helps answer:
                </p>
            </div>

            <div className="flex items-center justify-center mt-6">
                <ul className="list-disc text-left font-light text-gray-700 max-w-2xl text-lg">
                    <li className="mb-2">Are the rich getting richer while others stay the same?</li>
                    <li className="mb-2">How does income distribution vary from state to state?</li>
                </ul>
            </div>
            </div>
            <div className="items-center justify-center mt-10 mr-20">
                <p className="text-lg text-gray-700 max-w-2xl mb-2">
                    What’s the process?</p> <br/>
                    <p className="text-lg text-gray-700 font-light max-w-2xl">
                    We’ll break down income data by state and income bracket, then analyze how these distributions shift year over year. This will show whether income inequality is growing or shrinking in different parts of the country.
                    By visualizing these changes, we can see how income distribution evolves, providing a clearer picture of economic inequality.
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