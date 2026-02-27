import React from 'react';

const JobCard = ({ job }) => {
  const handleApply = () => {
    if (job.applyLink) {
      window.open(job.applyLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {job.jobTitle}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {job.company || 'Company not specified'}
        </p>
        <p className="text-xs text-gray-500 mb-3">
          {job.location || 'Location not specified'}
        </p>

        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 mb-3"
        >
          {job.employmentType || 'N/A'}
        </span>

        <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
          {job.description || 'No description provided for this role.'}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {job.postedAt && (
            <span>Posted: {new Date(job.postedAt).toLocaleDateString()}</span>
          )}
        </div>
        <button
          onClick={handleApply}
          disabled={!job.applyLink}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {job.applyLink ? 'Apply' : 'No Apply Link'}
        </button>
      </div>
    </div>
  );
};

export default JobCard;

