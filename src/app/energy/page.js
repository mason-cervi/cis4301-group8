import Dashboard from "../components/dashboards/EnergyDashboard";

export default function EnergyPage() {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex items-center justify-center text-center mt-12">
                <br/>
                <h1 className="text-2xl text-blue-900 mb-12">
                Ever wondered which areas are adopting energy-saving programs most effectively?
                </h1>
            </div>
            <div className="flex mb-8 items-center justify-center">
            <div className="m-10 ml-20">
            <div className="flex items-center justify-center">
                <p className="text-lg text-gray-700 max-w-2xl">
                <br/>
                This query digs into how your location—down to your state or ZIP code—affects the number of people claiming residential energy tax credits and how much they’re getting back. Essentially, it helps answer questions like:
                </p>
            </div>

            <div className="flex items-center justify-center mt-6">
                <ul className="list-disc text-left font-light text-gray-700 max-w-2xl text-lg">
                    <li className="mb-2">Are some regions better at taking advantage of energy-saving incentives?</li>
                    <li className="mb-2">How do these trends change over time?</li>
                </ul>
            </div>
            </div>
            <div className="items-center justify-center mt-10">
                <p className="text-lg text-gray-700 max-w-2xl mb-2">
                    What’s the process?</p> <br/>
                    <p className="text-lg text-gray-700 font-light max-w-2xl">
                    We’ll calculate an “uptake rate” by dividing the number of claims by the total number of tax returns in each income bracket. This gives a clearer picture of how widespread these claims are in different areas. By looking at this data over several years, we can track how adoption rates and claim amounts shift in different locations.
					The result? You’ll see which regions are leading the charge in adopting energy-saving measures and how government incentives are making a difference across the country.
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