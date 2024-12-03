import Dashboard from "../components/dashboards/DepCareDashboard";

export default function DependentCarePage() {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex items-center justify-center text-center mt-12">
                <br/>
                <h1 className="text-2xl text-blue-900 mb-12">
                Ever wondered if where you live impacts how much you can claim for dependent care?
                </h1>
            </div>
            <div className="flex mb-8 items-center justify-center">
            <div className="m-10 ml-20">
            <div className="flex items-center justify-center">
                <p className="text-lg text-gray-700 max-w-2xl">
                <br/>
                This query explores how dependent care tax claims vary across different states and over time. It aims to answer questions like:
                </p>
            </div>

            <div className="flex items-center justify-center mt-6">
                <ul className="list-disc text-left font-light text-gray-700 max-w-2xl text-lg">
                    <li className="mb-2">Do families in certain states claim more for dependent care?</li>
                    <li className="mb-2">Are these differences growing or shrinking over time?</li>
                </ul>
            </div>
            </div>
            <div className="items-center justify-center mt-10">
                <p className="text-lg text-gray-700 max-w-2xl mb-2">
                    What’s the process?</p> <br/>
                    <p className="text-lg text-gray-700 font-light max-w-2xl">
                    For each state, we’ll calculate the average claim amount per dependent. By comparing these figures year over year, we can spot trends and see if some states are consistently claiming higher amounts.
					The goal is to highlight geographical differences in how families benefit from dependent care credits and uncover any long-term patterns.
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