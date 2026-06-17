import React, {
  useState,
  useEffect,
  useRef
} from 'react';

import axios from 'axios';

import { io } from 'socket.io-client';

import {
  useNavigate
} from 'react-router-dom';

import {
  motion,
  AnimatePresence
} from 'framer-motion';

import {
  Bot,
  Loader2,
  Mic,
  Square,
  Volume2,
  Upload,
  CheckCircle2,
  PhoneOff
} from 'lucide-react';

import toast from 'react-hot-toast';
import {
  SERVER_URL,
  SOCKET_URL
} from '../config/api';

const API_URL =
  SERVER_URL;

const SESSION_KEY =
  'skillsync_interview_session';

const REPORT_KEY =
  'skillsync_interview_report';

const REPORTS_KEY =
  'skillsync_interview_reports';

const saveInterviewReport = (report) => {
  localStorage.setItem(
    REPORT_KEY,
    JSON.stringify(report)
  );

  const reports =
    JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]');

  reports.unshift({
    ...report,
    completedAt: new Date().toISOString()
  });

  localStorage.setItem(
    REPORTS_KEY,
    JSON.stringify(reports.slice(0, 20))
  );
};

const InterviewPrep = () => {

  // =========================
  // STATES
  // =========================

  const [socket, setSocket] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [isTyping, setIsTyping] =
    useState(false);

  const [sessionActive, setSessionActive] =
    useState(false);

  const [isRecording, setIsRecording] =
    useState(false);

  const [liveTranscript, setLiveTranscript] =
    useState('');

  const [resumeContext, setResumeContext] =
    useState('');

  const [resumeFile, setResumeFile] =
    useState(null);

  const [uploadingResume, setUploadingResume] =
    useState(false);

  const [uploadedResumeData, setUploadedResumeData] =
    useState(null);

  const [targetRole, setTargetRole] =
    useState('Full Stack Developer');

  const [finalReport, setFinalReport] =
    useState(null);

  const messagesEndRef =
    useRef(null);

  const mediaRecorderRef =
    useRef(null);

  const audioChunksRef =
    useRef([]);

  const token =
    localStorage.getItem('token');

  const navigate =
    useNavigate();

  // =========================
  // AUTO SAVE SESSION
  // =========================

  useEffect(() => {

    const sessionData = {

      messages,

      liveTranscript,

      resumeContext,

      uploadedResumeData,

      targetRole,

      sessionActive

    };

    localStorage.setItem(

      SESSION_KEY,

      JSON.stringify(sessionData)

    );

  }, [

    messages,

    liveTranscript,

    resumeContext,

    uploadedResumeData,

    targetRole,

    sessionActive

  ]);

  // =========================
  // RESTORE SESSION
  // =========================

  useEffect(() => {

    const savedSession =

      localStorage.getItem(
        SESSION_KEY
      );

    if (!savedSession) return;

    try {

      const parsed =
        JSON.parse(savedSession);

      if (
        !parsed.sessionActive
      ) {

        return;

      }

      const shouldResume =

        window.confirm(
          'Resume previous interview session?'
        );

      if (shouldResume) {

  setMessages(
    parsed.messages || []
  );

  setLiveTranscript(
    parsed.liveTranscript || ''
  );

  setResumeContext(
    parsed.resumeContext || ''
  );

  setUploadedResumeData(
    parsed.uploadedResumeData || null
  );

  setTargetRole(
    parsed.targetRole ||
    'Full Stack Developer'
  );

  setSessionActive(true);

  // =========================
  // RESTORE SOCKET SESSION
  // =========================

  const restoredSocket =
    io(`${SOCKET_URL}/interview`);

  restoredSocket.on(
    'connect',
    () => {

      console.log(
        'Restored interview socket'
      );

      restoredSocket.emit(
        'join_session',
        {

          resumeContext:
            parsed.resumeContext,

          targetRole:
            parsed.targetRole

        }
      );

    }
  );

  restoredSocket.on(
    'receive_question',
    (data) => {

      setIsTyping(false);

      setMessages((prev) => [

        ...prev,

        {
          id: Date.now(),
          role: 'ai',
          content: data.question
        }

      ]);

      speakQuestion(
        data.question
      );

    }
  );

  restoredSocket.on(
    'answer_received',
    () => {

      setIsTyping(true);

      setTimeout(() => {

        restoredSocket.emit(
          'request_question'
        );

      }, 1200);

    }
  );

  restoredSocket.on(
    'interview_completed',
    (report) => {

      saveInterviewReport(report);

      localStorage.removeItem(
        SESSION_KEY
      );

      navigate(
        '/interview-report',
        {
          state: {
            report
          }
        }
      );

    }
  );

  restoredSocket.on(
    'error',
    (data) => {

      console.error(data);

      toast.error(
        data.message ||
        'Socket restore failed'
      );

    }
  );

  setSocket(
    restoredSocket
  );

}

      else {

        localStorage.removeItem(
          SESSION_KEY
        );

      }

    }

    catch (err) {

      console.error(
        'Session restore error:',
        err
      );

    }

  }, []);

  // =========================
  // AUTO SCROLL
  // =========================

  const scrollToBottom = () => {

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });

  };

  useEffect(() => {

    scrollToBottom();

  }, [messages, isTyping]);

  // =========================
  // CLEANUP
  // =========================

  useEffect(() => {

    return () => {

      socket?.disconnect();

      speechSynthesis.cancel();

    };

  }, [socket]);

  // =========================
  // SPEAK QUESTION
  // =========================

  const speakQuestion = (text) => {

    speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = 'en-US';

    utterance.rate = 1;

    speechSynthesis.speak(utterance);

  };

  // =========================
  // UPLOAD RESUME
  // =========================

  const uploadResume =
    async (file) => {

      try {

        setUploadingResume(true);

        const formData =
          new FormData();

        formData.append(
          'resume',
          file
        );

        const response =
          await axios.post(

            `${API_URL}/api/resumes/upload`,

            formData,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

                'Content-Type':
                  'multipart/form-data'

              }

            }

          );

        const resumeData =
          response.data.resume;

        setUploadedResumeData(
          resumeData
        );

        setResumeContext(
          resumeData.interviewContext
        );

        toast.success(
          'Resume uploaded successfully'
        );

      }

      catch (err) {

        console.error(err);

        toast.error(
          err.response?.data?.message ||
          'Resume upload failed'
        );

      }

      finally {

        setUploadingResume(false);

      }

    };

  // =========================
  // START SESSION
  // =========================

  const startSession = (e) => {

    e.preventDefault();

    if (!resumeContext) {

      toast.error(
        'Please upload your resume first'
      );

      return;

    }

    const newSocket =
      io(`${SOCKET_URL}/interview`);

    newSocket.on(
      'connect',
      () => {

        console.log(
          'Connected to interview socket'
        );

        newSocket.emit(
          'join_session',
          {
            resumeContext,
            targetRole
          }
        );

      }
    );

    newSocket.on(
      'session_started',
      () => {

        setSessionActive(true);

        if (messages.length === 0) {

          setMessages([
            {
              id: Date.now(),
              role: 'system',
              content:
                `Welcome to your AI mock interview for ${targetRole}.`
            }
          ]);

        }

        setIsTyping(true);

        newSocket.emit(
          'request_question'
        );

      }
    );

    newSocket.on(
      'receive_question',
      (data) => {

        setIsTyping(false);

        setMessages((prev) => [

          ...prev,

          {
            id: Date.now(),
            role: 'ai',
            content: data.question
          }

        ]);

        speakQuestion(
          data.question
        );

      }
    );

    newSocket.on(
      'answer_received',
      () => {

        setIsTyping(true);

        setTimeout(() => {

          newSocket.emit(
            'request_question'
          );

        }, 1200);

      }
    );

    newSocket.on(
      'show_end_interview',
      () => {

        toast.success(
          'Interview completed. Please end the session.'
        );

      }
    );

    newSocket.on(
      'interview_completed',
      (report) => {

        saveInterviewReport(report);

        localStorage.removeItem(
          SESSION_KEY
        );

        setFinalReport(report);

        toast.success(
          'Interview completed successfully!'
        );

        setTimeout(() => {

          navigate(
            '/interview-report',
            {
              state: {
                report
              }
            }
          );

        }, 1500);

      }
    );

    newSocket.on(
      'error',
      (data) => {

        console.error(data);

        toast.error(
          data.message ||
          'Something went wrong'
        );

        setIsTyping(false);

      }
    );

    setSocket(newSocket);

  };

  // =========================
  // START RECORDING
  // =========================

  const startRecording =
    async () => {

      try {

        speechSynthesis.cancel();

        setLiveTranscript('');

        const stream =
          await navigator.mediaDevices.getUserMedia({
            audio: true
          });

        const mediaRecorder =
          new MediaRecorder(stream);

        mediaRecorderRef.current =
          mediaRecorder;

        audioChunksRef.current = [];

        mediaRecorder.ondataavailable =
          (event) => {

            if (
              event.data.size > 0
            ) {

              audioChunksRef.current.push(
                event.data
              );

            }

          };

        mediaRecorder.onstart =
          () => {

            setIsRecording(true);

          };

        mediaRecorder.start();

      }

      catch (err) {

        console.error(err);

        toast.error(
          'Microphone access denied'
        );

      }

    };

  // =========================
  // STOP RECORDING
  // =========================

  const stopRecording = () => {

    const mediaRecorder =
      mediaRecorderRef.current;

    if (!mediaRecorder) return;

    mediaRecorder.onstop =
      async () => {

        try {

          const audioBlob =
            new Blob(
              audioChunksRef.current,
              {
                type:
                  'audio/webm'
              }
            );

          const formData =
            new FormData();

          formData.append(
            'audio',
            audioBlob,
            'recording.webm'
          );

          setIsTyping(true);

          const response =
            await axios.post(

              `${API_URL}/api/transcribe`,

              formData,

              {

                headers: {

                  'Content-Type':
                    'multipart/form-data'

                }

              }

            );

          const transcript =
            response.data.transcript;

          if (!transcript) {

            toast.error(
              'No speech detected'
            );

            return;

          }

          setLiveTranscript(
            transcript
          );

          setMessages((prev) => [

            ...prev,

            {
              id: Date.now(),
              role: 'user',
              content: transcript
            }

          ]);

          socket?.emit(
            'submit_answer',
            {
              answer: transcript
            }
          );

        }

        catch (err) {

          console.error(err);

          toast.error(
            'Transcription failed'
          );

        }

        finally {

          setIsTyping(false);

        }

      };

    mediaRecorder.stop();

    setIsRecording(false);

  };

  // =========================
  // END INTERVIEW
  // =========================

  const endInterview = () => {

    if (!socket) return;

    socket.emit(
      'end_interview'
    );

  };

  // =========================
  // PRE INTERVIEW SCREEN
  // =========================

  if (!sessionActive) {

    return (

      <div className="min-h-screen pt-24 bg-gray-50 flex items-center justify-center px-4">

        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8"
        >

          <div className="text-center mb-10">

            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">

              <Bot size={40} />

            </div>

            <h1 className="text-4xl font-bold text-gray-900">

              AI Mock Interview

            </h1>

            <p className="text-gray-500 mt-4 text-lg">

              Upload your resume and practice personalized AI-powered mock interviews.

            </p>

          </div>

          <form
            onSubmit={startSession}
            className="space-y-6"
          >

            <div>

              <label className="block mb-2 font-medium text-gray-700">

                Target Role

              </label>

              <input
                type="text"

                value={targetRole}

                onChange={(e) =>
                  setTargetRole(
                    e.target.value
                  )
                }

                className="w-full border rounded-2xl px-4 py-3"
              />

            </div>

            <div>

              <label className="block mb-2 font-medium text-gray-700">

                Upload Resume

              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">

                <Upload
                  size={36}
                  className="mx-auto text-gray-400 mb-3"
                />

                <input
                  type="file"

                  accept=".pdf,.doc,.docx"

                  onChange={(e) => {

                    const file =
                      e.target.files[0];

                    if (file) {

                      setResumeFile(file);

                      uploadResume(file);

                    }

                  }}

                  className="w-full"
                />

                <p className="text-sm text-gray-500 mt-3">

                  Upload your PDF or DOCX resume

                </p>

              </div>

            </div>

            {

              uploadedResumeData && (

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">

                  <div className="flex items-center gap-2 mb-3">

                    <CheckCircle2
                      className="text-green-500"
                      size={20}
                    />

                    <h3 className="font-semibold text-blue-700">

                      Resume Uploaded Successfully

                    </h3>

                  </div>

                  <p className="text-sm text-gray-700">

                    {uploadedResumeData.originalName}

                  </p>

                </div>

              )

            }

            <button
              type="submit"

              disabled={
                uploadingResume
              }

              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-lg font-semibold disabled:opacity-50"
            >

              {

                uploadingResume

                  ? 'Uploading Resume...'

                  : 'Start AI Interview'

              }

            </button>

          </form>

        </motion.div>

      </div>

    );

  }

  // =========================
  // INTERVIEW SCREEN
  // =========================

  return (

    <div className="min-h-screen pt-24 bg-gray-50 px-4 pb-10">

      <div className="max-w-5xl mx-auto flex flex-col h-[85vh]">

        <div className="bg-white rounded-t-3xl border-b p-5 flex justify-between items-center">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">

              <Bot size={24} />

            </div>

            <div>

              <h2 className="font-bold text-lg">

                AI Interviewer

              </h2>

              <p className="text-sm text-gray-500">

                {targetRole}

              </p>

            </div>

          </div>

          <button
            onClick={endInterview}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl"
          >

            <PhoneOff size={18} />

            End Interview

          </button>

        </div>

        <div className="flex-1 overflow-y-auto bg-white p-6 space-y-6">

          <AnimatePresence>

            {

              messages.map((msg) => (

                <motion.div
                  key={msg.id}

                  initial={{
                    opacity: 0,
                    y: 10
                  }}

                  animate={{
                    opacity: 1,
                    y: 0
                  }}

                  className={`flex ${
                    msg.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >

                  <div
                    className={`max-w-[80%] px-5 py-4 rounded-3xl whitespace-pre-wrap text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : msg.role === 'system'
                        ? 'bg-orange-50 border border-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >

                    {

                      msg.role === 'ai' && (

                        <div className="mb-2 text-blue-500">

                          <Volume2 size={16} />

                        </div>

                      )

                    }

                    {msg.content}

                  </div>

                </motion.div>

              ))

            }

          </AnimatePresence>

          {

            liveTranscript && (

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">

                <p className="text-sm text-gray-500 mb-2">

                  Your Response

                </p>

                <p className="text-gray-800">

                  {liveTranscript}

                </p>

              </div>

            )

          }

          {

            isTyping && (

              <div className="flex items-center gap-2 text-gray-500">

                <Loader2
                  size={18}
                  className="animate-spin"
                />

                <span>

                  AI Interviewer is thinking...

                </span>

              </div>

            )

          }

          <div ref={messagesEndRef} />

        </div>

        <div className="bg-white border-t rounded-b-3xl p-6 flex justify-center">

          {

            !isRecording ? (

              <button
                onClick={startRecording}

                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-5 shadow-lg"
              >

                <Mic size={30} />

              </button>

            ) : (

              <button
                onClick={stopRecording}

                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-5 animate-pulse shadow-lg"
              >

                <Square size={30} />

              </button>

            )

          }

        </div>

      </div>

    </div>

  );

};

export default InterviewPrep;
