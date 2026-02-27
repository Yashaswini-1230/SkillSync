import React, { useState } from 'react';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import JobCard from '../components/JobCard';
import { searchJobs } from '../services/jobsService';

const roleOptions = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'DevOps Engineer',
  'Machine Learning Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Other'
];

const locationOptions = [
  'Any',
  'Hyderabad',
  'Bengaluru',
  'Chennai',
  'Mumbai',
  'Delhi',
  'Pune',
  'Remote',
  'Other'
];

const Jobs = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Any');
  const [customLocation, setCustomLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('ALL');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    const finalRole =
      selectedRole === 'Other' ? customRole.trim() : selectedRole.trim();

    if (!finalRole) {
      toast.error('Please select or enter a job role to search');
      return;
    }

    const finalLocation =
      selectedLocation === 'Other'
        ? customLocation.trim()
        : selectedLocation === 'Any'
        ? ''
        : selectedLocation;

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await searchJobs({
        role: finalRole,
        location: finalLocation,
        employmentType
      });

      if (response?.success) {
        setJobs(response.data || []);
      } else {
        setJobs([]);
        toast.error(response?.message || 'Failed to fetch jobs');
      }
    } catch (error) {
      setJobs([]);
      const message =
        error.response?.data?.message || 'Failed to fetch jobs. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedRole('');
    setCustomRole('');
    setSelectedLocation('Any');
    setCustomLocation('');
    setEmploymentType('ALL');
    setJobs([]);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen page-content pt-20 px-4 sm:px-6 lg:px-8 py-8 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Jobs & Internships
            </h1>
            <p className="text-gray-600 mt-1">
              Discover real-time opportunities tailored to your role and location.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {selectedRole === 'Other' && (
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="Enter a custom job role, e.g., Blockchain Developer"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              {selectedLocation === 'Other' && (
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Enter a custom location, e.g., London or Remote (EU)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">Any</option>
                <option value="INTERN">Internship</option>
                <option value="FULLTIME">Full-time</option>
                <option value="PARTTIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className="mr-2" size={16} />
              Clear Filters
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSearch className="mr-2" size={16} />
              {loading ? 'Searching...' : 'Search Jobs'}
            </button>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && hasSearched && jobs.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-700 font-medium mb-2">No jobs found</p>
            <p className="text-gray-500 text-sm">
              Try adjusting your role, location, or employment type filters.
            </p>
          </div>
        )}

        {/* Initial state (before search) */}
        {!loading && !hasSearched && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">
              Start by entering a job role and optionally a location to see
              real-time job and internship opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;

