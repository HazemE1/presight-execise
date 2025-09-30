import type { Profile as ProfileType } from '../../../models/profile';

interface ProfileCardProps {
    profile: ProfileType;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
    const displayHobbies = profile.hobbies.slice(0, 2);
    const remainingHobbies = profile.hobbies.length - 2;

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex items-start space-x-4">
                <img
                    src={profile.avatar}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {profile.first_name} {profile.last_name}
                        </h3>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{profile.nationality}</span>
                        <span>{profile.age} years old</span>
                    </div>
                    <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                            {displayHobbies.map((hobby: string, index: number) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                    {hobby}
                                </span>
                            ))}
                            {remainingHobbies > 0 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{remainingHobbies}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
