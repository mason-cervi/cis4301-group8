import StateMap from '../components/StateMap';

export default function MonetaryPolicyPage() {
    return (
        <div>
            <div className="items-center justify-center text-center mt-10">
            Monetary Policy Page
            </div>
            <div className="flex items-center justify-center ml-48 mr-48 mb-20">
            <StateMap />
            </div>
        </div>
    );
}