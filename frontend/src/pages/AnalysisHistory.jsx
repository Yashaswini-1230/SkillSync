import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FileText,
    Target,
    Calendar,
    Download,
    Search
} from "lucide-react";

const AnalysisHistory = () => {

    const [analyses, setAnalyses] = useState([]);
    const [filteredAnalyses, setFilteredAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api";

    useEffect(() => {
        fetchAnalyses();
    }, []);

    useEffect(() => {

        const filtered = analyses.filter((analysis) => {

            const resumeName =
                analysis.resumeId?.originalName?.toLowerCase() || "";

            const role =
                analysis.jobRole?.toLowerCase() || "";

            return (
                resumeName.includes(searchTerm.toLowerCase()) ||
                role.includes(searchTerm.toLowerCase())
            );
        });

        setFilteredAnalyses(filtered);

    }, [searchTerm, analyses]);

    const fetchAnalyses = async () => {

        try {

            const response = await axios.get(
                `${API_URL}/analysis`,
                {
                    headers: {
                        "x-auth-token":
                            localStorage.getItem("token")
                    }
                }
            );

            setAnalyses(response.data);
            setFilteredAnalyses(response.data);

        } catch (error) {

            console.error(
                "Failed to fetch analyses:",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    if (loading) {

        return (

            <div className="min-h-screen flex justify-center items-center">

                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>

            </div>

        );
    }

    return (

        <div className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-7xl mx-auto">

                {/* Header */}

                <div className="mb-8">

                    <h1 className="text-3xl font-bold text-gray-900">

                        Analysis History

                    </h1>

                    <p className="text-gray-500 mt-2">

                        View all your previous resume analyses.

                    </p>

                </div>

                {/* Search */}

                <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">

                    <div className="relative">

                        <Search
                            size={18}
                            className="absolute left-3 top-3 text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Search by resume name or role..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                </div>

                {/* Table */}

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-100">

                                <tr>

                                    <th className="text-left px-6 py-4 font-semibold">

                                        Resume

                                    </th>

                                    <th className="text-left px-6 py-4 font-semibold">

                                        Job Role

                                    </th>

                                    <th className="text-left px-6 py-4 font-semibold">

                                        ATS Score

                                    </th>

                                    <th className="text-left px-6 py-4 font-semibold">

                                        Date

                                    </th>

                                    <th className="text-center px-6 py-4 font-semibold">

                                        Actions

                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredAnalyses.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="text-center py-10 text-gray-500"
                                        >

                                            No analyses found.

                                        </td>

                                    </tr>

                                ) : (

                                    filteredAnalyses.map((analysis) => (

                                        <tr
                                            key={analysis._id}
                                            className="border-t hover:bg-gray-50"
                                        >

                                            {/* Resume */}

                                            <td className="px-6 py-4">

                                                <div className="flex items-center gap-2">

                                                    <FileText
                                                        size={18}
                                                        className="text-blue-600"
                                                    />

                                                    <span className="font-medium">

                                                        {analysis.resumeId
                                                            ?.originalName ||
                                                            "Resume"}

                                                    </span>

                                                </div>

                                            </td>

                                            {/* Role */}

                                            <td className="px-6 py-4">

                                                <div className="flex items-center gap-2">

                                                    <Target
                                                        size={18}
                                                        className="text-indigo-600"
                                                    />

                                                    {analysis.jobRole}

                                                </div>

                                            </td>

                                            {/* Score */}

                                            <td className="px-6 py-4">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                        analysis.atsScore >= 80
                                                            ? "bg-green-100 text-green-700"
                                                            : analysis.atsScore >=
                                                              60
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >

                                                    {analysis.atsScore}%

                                                </span>

                                            </td>

                                            {/* Date */}

                                            <td className="px-6 py-4">

                                                <div className="flex items-center gap-2">

                                                    <Calendar
                                                        size={18}
                                                        className="text-gray-500"
                                                    />

                                                    {new Date(
                                                        analysis.analyzedAt
                                                    ).toLocaleDateString()}

                                                </div>

                                            </td>

                                            {/* Actions */}

                                            <td className="px-6 py-4 text-center">

                                                <a
                                                    href={`${API_URL}/analysis/${analysis._id}/download`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                                                >

                                                    <Download size={16} />

                                                    Report

                                                </a>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    );
};

export default AnalysisHistory;