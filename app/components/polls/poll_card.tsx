import { FC } from 'react';

interface PollCardProps {
    title: string;
    description: string;
    endDate: string;
    options: string[]
    vote_count: number;
}

const PollCard: FC<PollCardProps> = ({ title, description, endDate, options, vote_count }) => {
    const formatDate = (date: string) => new Date(date).toLocaleString();
    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-medium text-white">{title}</h3>
            <p className="text-gray-400">{description}</p>
            <p className="text-sm text-gray-500">End Date: {formatDate(endDate)}</p>
            <ul className="mt-2">
                {options.map((option, index) => (
                    <li key={index} className="text-gray-300">
                        {option}
                    </li>
                ))}
            </ul>

            {/* You can add any additional elements here, like buttons or links to vote */}
            <div className="mt-2">
                <span className="text-sm text-gray-500">Votes: {vote_count}</span>
            </div>
            <div className="mt-4">
                <button className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-400">
                    Vote
                </button>
            </div>
        </div>
    );
};

export default PollCard;
