import Link from 'next/link';

export default function Header() {
    return (
        <div className="border-b border-white-500 bg-black text-white py-4 flex justify-between items-center px-3">
            <Link href="../" className="ml-20"><h4 className="p-2">Home</h4></Link>
        </div>
    )
}