import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUpload, FiSearch, FiDownload, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalAnalyses: 0,
    avgAtsScore: 0
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchAnalyses = async () => {
            try {
                const res = await axios.get('/api/analysis', {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setAnalyses(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalyses();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
    }

    // Process data for charts
    const chartData = analyses.slice(0, 10).reverse().map(a => ({
        name: new Date(a.analyzedAt).toLocaleDateString(),
        score: a.atsScore || a.ats_score || 0
    }));

    const avgScore = analyses.length ? Math.round(analyses.reduce((acc, curr) => acc + (curr.atsScore || curr.ats_score || 0), 0) / analyses.length) : 0;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                
                <header>
                    <h1 className="text-3xl font-bold text-gray-900">Career Intelligence Dashboard</h1>
                    <p className="text-gray-500 mt-1">Track your ATS compatibility and interview readiness.</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-500 font-medium">Avg. ATS Score</h3>
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-full"><Target size={20} /></div>
                        </div>
                        <p className="text-3xl font-bold mt-4 text-gray-900">{avgScore}%</p>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-500 font-medium">Resumes Analyzed</h3>
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-full"><FileText size={20} /></div>
                        </div>
                        <p className="text-3xl font-bold mt-4 text-gray-900">{analyses.length}</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-500 font-medium">Mock Interviews</h3>
                            <div className="w-10 h-10 bg-green-50 text-green-600 flex items-center justify-center rounded-full"><CheckCircle size={20} /></div>
                        </div>
                        <p className="text-3xl font-bold mt-4 text-gray-900">0</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-gray-500 font-medium">Skill Growth</h3>
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 flex items-center justify-center rounded-full"><TrendingUp size={20} /></div>
                        </div>
                        <p className="text-3xl font-bold mt-4 text-gray-900">+12%</p>
                    </motion.div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">ATS Score Progression</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                                    <RechartsTooltip />
                                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Analyses</h3>
                        <div className="space-y-4">
                            {analyses.slice(0, 5).map(analysis => (
                                <div key={analysis._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{analysis.jobRole}</h4>
                                        <p className="text-sm text-gray-500">{new Date(analysis.analyzedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            (analysis.atsScore || analysis.ats_score) >= 80 ? 'bg-green-100 text-green-700' : 
                                            (analysis.atsScore || analysis.ats_score) >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {analysis.atsScore || analysis.ats_score}%
                                        </span>
                                        <a href={`/api/analysis/${analysis._id}/download`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium">Report</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
