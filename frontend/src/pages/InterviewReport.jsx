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
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Brain,
  CheckCircle2,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Target,
  Trophy
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

const parseScore = (value) => {
  const num = Number(value);

  if (Number.isNaN(num)) {
    return 0;
  }

  return Number(num.toFixed(1));
};

const ScoreCard = ({
  label,
  value,
  icon: Icon,
  tone
}) => {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    violet: 'bg-violet-50 text-violet-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600'
  };

  return (
    <div className={`${tones[tone]} rounded-2xl p-5 sm:p-6`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm sm:text-base font-medium text-gray-600">
          {label}
        </p>
        <Icon size={22} className="shrink-0" />
      </div>

      <p className="mt-5 text-4xl sm:text-5xl font-bold tracking-normal">
        {value}/10
      </p>
    </div>
  );
};

const FeedbackList = ({
  title,
  icon: Icon,
  items,
  emptyText,
  tone
}) => {
  const toneClass =
    tone === 'yellow'
      ? 'bg-yellow-50 text-yellow-800 border-yellow-100'
      : 'bg-blue-50 text-blue-800 border-blue-100';

  const IconMarker =
    tone === 'yellow' ? AlertTriangle : CheckCircle2;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <Icon className={tone === 'yellow' ? 'text-yellow-600' : 'text-blue-600'} />
        <h2 className="text-2xl font-bold text-gray-900">
          {title}
        </h2>
      </div>

      {items?.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className={`${toneClass} flex items-start gap-3 rounded-xl border p-4 leading-relaxed`}
            >
              <IconMarker size={18} className="mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl bg-gray-50 p-4 text-gray-500">
          {emptyText}
        </div>
      )}
    </motion.div>
  );
};

const InterviewReport = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const report =
    location.state?.report ||
    getStoredReport();

  if (!report) {
    return (
      <div className="min-h-screen page-content bg-gray-50 px-4 pt-28 pb-12">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl bg-white p-8 text-center shadow-lg border border-gray-100">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 text-yellow-600">
            <Trophy size={32} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            No Interview Report Found
          </h1>

          <p className="mt-3 text-gray-500">
            Start a mock interview to generate a fresh performance report.
          </p>

          <button
            onClick={() => navigate('/interview')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <RotateCcw size={18} />
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  const overallScore = parseScore(report.score);
  const communicationScore = parseScore(report.communication_score);
  const confidenceScore = parseScore(report.confidence_score);
  const technicalScore = parseScore(report.technical_depth_score);
  const clarityScore = parseScore(report.clarity_score);
  const problemSolvingScore = parseScore(report.problem_solving_score);

  const scoreCards = [
    {
      label: 'Overall Score',
      value: overallScore,
      icon: Trophy,
      tone: 'blue'
    },
    {
      label: 'Confidence',
      value: confidenceScore,
      icon: Gauge,
      tone: 'green'
    },
    {
      label: 'Technical Depth',
      value: technicalScore,
      icon: Brain,
      tone: 'violet'
    },
    {
      label: 'Communication',
      value: communicationScore,
      icon: MessageSquare,
      tone: 'cyan'
    },
    {
      label: 'Clarity',
      value: clarityScore,
      icon: Target,
      tone: 'amber'
    },
    {
      label: 'Problem Solving',
      value: problemSolvingScore,
      icon: BarChart3,
      tone: 'rose'
    }
  ];

  const radarData = [
    {
      subject: 'Communication',
      score: communicationScore
    },
    {
      subject: 'Confidence',
      score: confidenceScore
    },
    {
      subject: 'Technical',
      score: technicalScore
    },
    {
      subject: 'Clarity',
      score: clarityScore
    },
    {
      subject: 'Problem Solving',
      score: problemSolvingScore
    }
  ];

  const barData = [
    {
      name: 'Overall',
      score: overallScore
    },
    {
      name: 'Comm.',
      score: communicationScore
    },
    {
      name: 'Tech.',
      score: technicalScore
    },
    {
      name: 'Clarity',
      score: clarityScore
    },
    {
      name: 'Problem',
      score: problemSolvingScore
    }
  ];

  return (
    <div className="min-h-screen page-content bg-gray-50 px-4 sm:px-6 lg:px-8 pt-28 pb-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>

            <button
              onClick={() => navigate('/interview')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <RotateCcw size={18} />
              Retake Interview
            </button>
          </div>
        </div>

        <motion.section
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-yellow-50 text-yellow-600">
                <Trophy size={32} />
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-normal">
                  Interview Report
                </h1>

                <p className="mt-3 max-w-2xl text-base sm:text-lg text-gray-500">
                  AI-powered interview performance analytics with score breakdowns and recruiter feedback.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 px-5 py-4 text-left lg:text-right">
              <p className="text-sm font-medium text-gray-500">
                Final Rating
              </p>
              <p className="mt-1 text-4xl font-bold text-blue-600">
                {overallScore}/10
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
            {scoreCards.map((card) => (
              <ScoreCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                tone={card.tone}
              />
            ))}
          </div>
        </motion.section>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.section
            initial={{
              opacity: 0,
              x: -20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            className="min-w-0 rounded-2xl bg-white shadow-lg border border-gray-100 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Brain className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Skill Analysis
              </h2>
            </div>

            <div className="h-[360px] min-h-[320px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.55}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          <motion.section
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            className="min-w-0 rounded-2xl bg-white shadow-lg border border-gray-100 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Target className="text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Performance Scores
              </h2>
            </div>

            <div className="h-[360px] min-h-[320px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar
                    dataKey="score"
                    fill="#16a34a"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <FeedbackList
            title="Strengths"
            icon={MessageSquare}
            items={report.strengths}
            emptyText="No strengths detected yet."
            tone="blue"
          />

          <FeedbackList
            title="Improvements"
            icon={Lightbulb}
            items={report.improvements}
            emptyText="No improvement suggestions available."
            tone="yellow"
          />
        </div>

        <motion.section
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="rounded-2xl bg-white shadow-lg border border-gray-100 p-6 sm:p-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">
            AI Recruiter Feedback
          </h2>

          <div className="rounded-2xl bg-gray-50 p-5 sm:p-6 text-gray-700 leading-relaxed">
            {report.feedback || 'No recruiter feedback available.'}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default InterviewReport;
