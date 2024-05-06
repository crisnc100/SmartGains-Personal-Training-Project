import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';


const AllClients = () => {
  const [allClients, setAllClients] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllClients();
  }, []);

  const fetchAllClients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/existing_clients', { withCredentials: true });
      if (response.data.all_clients) {
        setAllClients(response.data.all_clients);
      } else {
        setError('Data not found');
      }
    } catch (error) {
      setError(error.response ? error.response.data.error : 'Something went wrong');
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      console.log(`Sending DELETE request for client ID ${clientId}`);
      try {
        const response = await axios.delete(`http://localhost:5000/api/delete_client/${clientId}`, { withCredentials: true });
        console.log(`Received response: `, response.data);
        setAllClients(allClients.filter(client => client.id !== clientId));
        alert("Client deleted successfully.");
      } catch (error) {
        if (error.response) {
          console.error(`Server responded with non-2xx code: ${error.response.data}`);
          setError(`Failed to delete the client: ${error.response.data.message}`);
        } else if (error.request) {
          console.error("No response received:", error.request);
          setError('No response from server');
        } else {
          console.error("Error setting up the DELETE request:", error.message);
          setError('Error setting up the delete request');
        }
      }
    }
  };


  return (
    <div style={{ padding: '1rem' }}>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Clients</h1>
      <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allClients.map(client => (
              <tr key={client.id} className="hover:bg-gray-100 cursor-pointer transform hover:scale-[1.02] transition duration-300">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <NavLink to={`${client.id}/current-client`} className="hover:text-blue-600">{client.first_name} {client.last_name}</NavLink>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <NavLink to="#" className="hover:text-blue-600">{client.email}</NavLink>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-2 p-1 rounded"
                    title="Delete Client"
                  >
                    <FaTrash className="w-5 h-5" aria-hidden="true" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllClients;
