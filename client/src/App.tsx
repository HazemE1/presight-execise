import { useState } from "react";
import "./App.css";
import ProfilesList from "./components/ProfilesList";
import FiltersSidebar from "./components/FiltersSidebar";
import SearchBox from "./components/SearchBox";
import StreamingResponse from "./components/StreamingResponse";
import WebworkerRequests from "./components/WebworkerRequests";

function App() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'streaming' | 'webworker'>('profiles');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);

  const handleFiltersChange = (hobbies: string[], nationalities: string[]) => {
    setSelectedHobbies(hobbies);
    setSelectedNationalities(nationalities);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Presight Frontend Exercise</h1>
            <p className="text-gray-600 mt-1">Hazem El-khalil Presight contribution</p>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="px-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('profiles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profiles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Profiles & Virtual Scroll
              </button>
              <button
                onClick={() => setActiveTab('streaming')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'streaming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Streaming Response
              </button>
              <button
                onClick={() => setActiveTab('webworker')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'webworker'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Webworker & WebSocket
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="p-6">
          {activeTab === 'profiles' && (
            <div className="flex gap-6">
              {/* Sidebar */}
              <FiltersSidebar onFiltersChange={handleFiltersChange} />

              {/* Main Content */}
              <div className="flex-1">
                <div className="mb-6">
                  <SearchBox onSearchChange={setSearchTerm} />
                </div>
                <ProfilesList
                  searchTerm={searchTerm}
                  selectedHobbies={selectedHobbies}
                  selectedNationalities={selectedNationalities}
                />
              </div>
            </div>
          )}

          {activeTab === 'streaming' && (
            <div className="max-w-4xl mx-auto">
              <StreamingResponse />
            </div>
          )}

          {activeTab === 'webworker' && (
            <div className="max-w-6xl mx-auto">
              <WebworkerRequests />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
