import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NutritionProfile = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch clients for the specific trainer
    axios.get('http://localhost:5000/api/get_all_nutrition_profiles', { withCredentials: true })
      .then(response => {
        const sortedClients = response.data.sort((a, b) => {
          const fullNameA = `${a.first_name} ${a.last_name}`.toLowerCase();
          const fullNameB = `${b.first_name} ${b.last_name}`.toLowerCase();
          return fullNameA.localeCompare(fullNameB);
        });
        setClients(sortedClients);
        setFilteredClients(sortedClients.slice(0, 10));  // Initially show the first 10 clients
      })
      .catch(error => {
        console.error('Error fetching clients:', error);
      });
  }, []);

  useEffect(() => {
    // Filter clients based on search term
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    setFilteredClients(
      clients.filter(client => {
        const fullName = `${client.first_name} ${client.last_name}`.toLowerCase();
        return fullName.includes(lowercasedSearchTerm);
      }).slice(0, page * 10)  // Apply pagination to filtered results
    );
  }, [searchTerm, clients, page]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);  // Reset page number on new search
  };

  const handleViewProfile = (clientId) => {
    navigate(`/nutrition-profile/${clientId}`);
  };

  const handleAddProfile = (clientId) => {
    navigate(`add/${clientId}`);
  };

  const loadMoreClients = () => {
    if (page * 10 >= clients.length) {
      setHasMore(false);  // No more clients to load
    } else {
      setPage(page + 1);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen" style={{color: 'black'}}>
      <h1 className="text-3xl font-bold text-center mb-6">Nutrition Profiles</h1>
      <div className="max-w-md mx-auto">
        <input 
          type="text" 
          placeholder="Search clients..." 
          value={searchTerm} 
          onChange={handleSearchChange} 
          className="w-full p-2 mb-4 border border-gray-300 rounded"
        />
      </div>
      <div className="grid gap-4 max-w-2xl mx-auto">
        {filteredClients.map(client => (
          <div key={client.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">{client.first_name} {client.last_name}</p>
            </div>
            <div>
              {client.has_nutrition_profile ? (
                <button 
                  onClick={() => handleViewProfile(client.id)} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  View Profile
                </button>
              ) : (
                <button 
                  onClick={() => handleAddProfile(client.id)} 
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add Profile
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={loadMoreClients} 
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default NutritionProfile;
