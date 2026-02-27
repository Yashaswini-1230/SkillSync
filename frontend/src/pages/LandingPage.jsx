import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiBarChart2,
  FiBriefcase,
  FiFileText,
  FiMessageSquare,
  FiShield,
  FiZap
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  // Keep the authenticated experience unchanged.
  if (user) return <Navigate to="/dashboard" replace />;

  const features = [
    {
      title: 'AI Resume Analyzer',
      description:
        'Semantic matching + ATS-style scoring to show how well your resume aligns with a job role.',
      icon: FiBarChart2
    },
    {
      title: 'Resume Builder',
      description:
        'Build ATS-friendly resumes with clean templates, live preview, and easy editing.',
      icon: FiFileText
    },
    {
      title: 'AI Interview Preparation',
      description:
        'Practice role-relevant questions generated from your resume and improve confidently.',
      icon: FiMessageSquare
    },
    {
      title: 'Jobs & Internships Module',
      description:
        'Explore opportunities and quickly jump to official job portals to apply.',
      icon: FiBriefcase
    }
  ];

  const steps = [
    {
      title: 'Upload or Build',
      description:
        'Upload an existing resume (PDF/DOCX) or create one using the Resume Builder.',
      icon: FiZap
    },
    {
      title: 'Analyze & Improve',
      description:
        'Paste a job description and get ATS scoring, skill gaps, and actionable improvements.',
      icon: FiBarChart2
    },
    {
      title: 'Prepare & Apply',
      description:
        'Generate interview questions, refine your resume, and apply through official portals.',
      icon: FiArrowRight
    }
  ];

  const testimonials = [
    {
      name: 'Aarav S.',
      role: 'Software Engineer',
      quote:
        'SkillSync helped me spot missing keywords and improve my resume structure. The suggestions felt relevant to the role I was applying for.'
    },
    {
      name: 'Meera K.',
      role: 'Data Analyst',
      quote:
        'The analysis + interview prep combo was the most useful. I could focus on gaps and practice questions tailored to my resume.'
    },
    {
      name: 'Rahul P.',
      role: 'Fresher',
      quote:
        'The Resume Builder templates look professional and are easy to edit. The live preview makes it simple to iterate quickly.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 text-white">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shadow-sm">
              <span className="font-extrabold tracking-tight">SS</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">SkillSync</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-semibold"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl bg-white text-indigo-700 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200 font-bold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 shadow-sm">
              <FiShield className="opacity-90" />
              <span className="text-sm font-semibold text-white/90">
                Professional, ATS-friendly resume optimization
              </span>
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Land Your Dream Job with AI-Powered Resume Optimization
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-white/90 leading-relaxed">
              Semantic AI matching, ATS scoring, and a modern Resume Builder to
              help you tailor your resume for every role.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-white text-indigo-700 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started
                <FiArrowRight className="ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Login
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-white/85">
              <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3 shadow-sm">
                <div className="font-bold text-white">Semantic Matching</div>
                <div className="text-white/80">Role-aware similarity scoring</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3 shadow-sm">
                <div className="font-bold text-white">ATS Score</div>
                <div className="text-white/80">Actionable improvement tips</div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3 shadow-sm col-span-2 sm:col-span-1">
                <div className="font-bold text-white">Resume Builder</div>
                <div className="text-white/80">Templates + live preview</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Everything you need to optimize, prepare, and apply
            </h2>
            <p className="mt-3 text-gray-600 text-lg">
              SkillSync combines resume analysis, building, interview prep, and
              job discovery into one clean workflow.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 font-bold text-lg">{f.title}</h3>
                  <p className="mt-2 text-gray-600">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-b from-white to-indigo-50 text-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              How it works
            </h2>
            <p className="mt-3 text-gray-600 text-lg">
              A simple 3-step workflow that fits how you already apply.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Icon size={22} />
                    </div>
                    <span className="text-sm font-bold text-gray-400">
                      Step {idx + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-bold text-lg">{s.title}</h3>
                  <p className="mt-2 text-gray-600">{s.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Free
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Loved by job seekers
            </h2>
            <p className="mt-3 text-gray-600 text-lg">
              Placeholder testimonials (replace with real feedback when ready).
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 p-6 transition-all duration-300"
              >
                <p className="text-gray-700 leading-relaxed">“{t.quote}”</p>
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="font-semibold text-white">SkillSync</div>
              <div className="text-sm mt-1">
                © 2026 SkillSync. All rights reserved.
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <button
                type="button"
                className="hover:text-white transition-colors"
              >
                Privacy
              </button>
              <button
                type="button"
                className="hover:text-white transition-colors"
              >
                Terms
              </button>
              <a
                href="mailto:contact@skillsync.app"
                className="hover:text-white transition-colors"
              >
                Contact
              </a>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

