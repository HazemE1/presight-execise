import { useState, useEffect } from 'react';

interface FiltersData {
    hobbies: string[];
    nationalities: string[];
}

interface FiltersSidebarProps {
    onFiltersChange: (hobbies: string[], nationalities: string[]) => void;
}

export default function FiltersSidebar({ onFiltersChange }: FiltersSidebarProps) {
    const [filters, setFilters] = useState<FiltersData>({ hobbies: [], nationalities: [] });
    const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
    const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        onFiltersChange(selectedHobbies, selectedNationalities);
    }, [selectedHobbies, selectedNationalities, onFiltersChange]);

    const fetchFilters = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/filters');
            const data = await response.json();
            setFilters(data);
        } catch (error) {
            console.error('Error fetching filters:', error);
        }
    };

    const toggleHobby = (hobby: string) => {
        setSelectedHobbies(prev =>
            prev.includes(hobby)
                ? prev.filter(h => h !== hobby)
                : [...prev, hobby]
        );
    };

    const toggleNationality = (nationality: string) => {
        setSelectedNationalities(prev =>
            prev.includes(nationality)
                ? prev.filter(n => n !== nationality)
                : [...prev, nationality]
        );
    };

    const clearFilters = () => {
        setSelectedHobbies([]);
        setSelectedNationalities([]);
    };

    return (
        <div className="w-80 bg-gray-50 p-4 border-r border-gray-200">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* Hobbies Filter */}
            <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Top Hobbies</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filters.hobbies.map((hobby) => (
                        <label key={hobby} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedHobbies.includes(hobby)}
                                onChange={() => toggleHobby(hobby)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{hobby}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Nationalities Filter */}
            <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Top Nationalities</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filters.nationalities.map((nationality) => (
                        <label key={nationality} className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedNationalities.includes(nationality)}
                                onChange={() => toggleNationality(nationality)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{nationality}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Active Filters Summary */}
            {(selectedHobbies.length > 0 || selectedNationalities.length > 0) && (
                <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Active Filters:</h5>
                    <div className="space-y-1">
                        {selectedHobbies.length > 0 && (
                            <div className="text-xs text-blue-800">
                                Hobbies: {selectedHobbies.length} selected
                            </div>
                        )}
                        {selectedNationalities.length > 0 && (
                            <div className="text-xs text-blue-800">
                                Nationalities: {selectedNationalities.length} selected
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
