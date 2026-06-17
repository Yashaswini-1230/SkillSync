import React from 'react';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar
} from 'recharts';

import {
  motion
} from 'framer-motion';

import {
  Trophy,
  Brain,
  MessageSquare,
  Target,
  Lightbulb
} from 'lucide-react';

import {
  useLocation,
  useNavigate
} from 'react-router-dom';

const getStoredReport = () => {
  try {
    return JSON.parse(
      localStorage.getItem('skillsync_interview_report') ||
      'null'
    );
  } catch {
    return null;
  }
};

const InterviewReport = () => {

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const report =
    location.state?.report ||
    getStoredReport();
    console.log(report);

  // =========================
  // NO REPORT
  // =========================

  if (!report) {

    return (

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">

        <h1 className="text-3xl font-bold mb-4">

          No Interview Report Found

        </h1>

        <button
          onClick={() =>
            navigate('/interview')
          }
          className="px-6 py-3 bg-blue-600 text-white rounded-xl"
        >

          Start Interview

        </button>

      </div>

    );

  }

  // =========================
  // SAFE NUMBER PARSER
  // =========================

  const parseScore = (
    value
  ) => {

    const num =
      Number(value);

    if (
      isNaN(num)
    ) {

      return 0;

    }

    return Number(
      num.toFixed(1)
    );

  };

  // =========================
  // SCORES
  // =========================

  const overallScore =
    parseScore(
      report.score
    );

  const communicationScore =
    parseScore(
      report.communication_score
    );

  const confidenceScore =
    parseScore(
      report.confidence_score
    );

  const technicalScore =
    parseScore(
      report.technical_depth_score
    );

  const clarityScore =
    parseScore(
      report.clarity_score
    );

  const problemSolvingScore =
    parseScore(
      report.problem_solving_score
    );

  // =========================
  // RADAR DATA
  // =========================

  const radarData = [

    {
      subject:
        'Communication',

      score:
        communicationScore
    },

    {
      subject:
        'Confidence',

      score:
        confidenceScore
    },

    {
      subject:
        'Technical',

      score:
        technicalScore
    },

    {
      subject:
        'Clarity',

      score:
        clarityScore
    },

    {
      subject:
        'Problem Solving',

      score:
        problemSolvingScore
    }

  ];

  // =========================
  // BAR DATA
  // =========================

  const barData = [

    {
      name: 'Overall',
      score:
        overallScore
    },

    {
      name: 'Technical',
      score:
        technicalScore
    },

    {
      name: 'Confidence',
      score:
        confidenceScore
    }

  ];

  return (

    <div className="min-h-screen bg-gray-50 py-10 px-4">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >

          <div className="flex items-center gap-4 mb-6">

            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">

              <Trophy size={32} />

            </div>

            <div>

              <h1 className="text-4xl font-bold text-gray-900">

                Interview Report

              </h1>

              <p className="text-gray-500 mt-2">

                AI-powered interview performance analytics

              </p>

            </div>

          </div>

          {/* SCORE CARDS */}

          <div className="grid md:grid-cols-3 gap-6 mt-8">

            <div className="bg-blue-50 rounded-2xl p-6">

              <p className="text-gray-500 mb-2">

                Overall Score

              </p>

              <h2 className="text-5xl font-bold text-blue-600">

                {overallScore}/10

              </h2>

            </div>

            <div className="bg-green-50 rounded-2xl p-6">

              <p className="text-gray-500 mb-2">

                Confidence

              </p>

              <h2 className="text-5xl font-bold text-green-600">

                {confidenceScore}/10

              </h2>

            </div>

            <div className="bg-purple-50 rounded-2xl p-6">

              <p className="text-gray-500 mb-2">

                Technical Depth

              </p>

              <h2 className="text-5xl font-bold text-purple-600">

                {technicalScore}/10

              </h2>

            </div>

          </div>

        </motion.div>

        {/* CHARTS */}

        <div className="grid lg:grid-cols-2 gap-8">

          {/* RADAR */}

          <motion.div
            initial={{
              opacity: 0,
              x: -20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >

            <div className="flex items-center gap-3 mb-6">

              <Brain className="text-blue-600" />

              <h2 className="text-2xl font-bold">

                Skill Analysis

              </h2>

            </div>

            <div className="h-[400px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <RadarChart
                  data={radarData}
                >

                  <PolarGrid />

                  <PolarAngleAxis
                    dataKey="subject"
                  />

                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 10]}
                  />

                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.6}
                  />

                </RadarChart>

              </ResponsiveContainer>

            </div>

          </motion.div>

          {/* BAR CHART */}

          <motion.div
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >

            <div className="flex items-center gap-3 mb-6">

              <Target className="text-green-600" />

              <h2 className="text-2xl font-bold">

                Performance Scores

              </h2>

            </div>

            <div className="h-[400px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={barData}
                >

                  <XAxis
                    dataKey="name"
                  />

                  <YAxis
                    domain={[0, 10]}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="score"
                    fill="#16a34a"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </motion.div>

        </div>

        {/* FEEDBACK */}

        <div className="grid lg:grid-cols-2 gap-8">

          {/* STRENGTHS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >

            <div className="flex items-center gap-3 mb-6">

              <MessageSquare className="text-blue-600" />

              <h2 className="text-2xl font-bold">

                Strengths

              </h2>

            </div>

            {

              report.strengths?.length > 0

              ? (

                <ul className="space-y-4">

                  {

                    report.strengths.map(
                      (
                        item,
                        index
                      ) => (

                        <li
                          key={index}
                          className="bg-blue-50 p-4 rounded-2xl"
                        >

                          ✅ {item}

                        </li>

                      )
                    )

                  }

                </ul>

              )

              : (

                <div className="bg-gray-50 p-4 rounded-2xl text-gray-500">

                  No strengths detected yet.

                </div>

              )

            }

          </motion.div>

          {/* IMPROVEMENTS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >

            <div className="flex items-center gap-3 mb-6">

              <Lightbulb className="text-yellow-600" />

              <h2 className="text-2xl font-bold">

                Improvements

              </h2>

            </div>

            {

              report.improvements?.length > 0

              ? (

                <ul className="space-y-4">

                  {

                    report.improvements.map(
                      (
                        item,
                        index
                      ) => (

                        <li
                          key={index}
                          className="bg-yellow-50 p-4 rounded-2xl"
                        >

                          ⚡ {item}

                        </li>

                      )
                    )

                  }

                </ul>

              )

              : (

                <div className="bg-gray-50 p-4 rounded-2xl text-gray-500">

                  No improvement suggestions available.

                </div>

              )

            }

          </motion.div>

        </div>

        {/* AI FEEDBACK */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >

          <h2 className="text-3xl font-bold mb-6">

            AI Recruiter Feedback

          </h2>

          <div className="bg-gray-50 rounded-2xl p-6 text-gray-700 leading-relaxed">

            {

              report.feedback ||

              'No recruiter feedback available.'

            }

          </div>

        </motion.div>

      </div>

    </div>

  );

};

export default InterviewReport;
