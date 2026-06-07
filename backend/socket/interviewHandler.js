const aiClient =
    require('../services/aiClient');

module.exports = (io) => {

    const interviewNamespace =
        io.of('/interview');

    interviewNamespace.on(
        'connection',
        (socket) => {

            console.log(
                `Socket connected: ${socket.id}`
            );

            // =========================
            // SESSION STATE
            // =========================

            socket.session = {

                history: [],

                resumeContext: "",

                targetRole: "",

                evaluations: [],

                answers: [],

                askedQuestions: [],

                latestQuestion: null,

                interviewCompleted: false

            };

            // =========================
            // START SESSION
            // =========================

            socket.on(
                'join_session',
                async ({
                    resumeContext,
                    targetRole
                }) => {

                    try {

                        console.log(
                            `Interview session started for role: ${targetRole}`
                        );

                        socket.session = {

                            history: [],

                            resumeContext:
                                resumeContext || "",

                            targetRole:
                                targetRole || "",

                            evaluations: [],

                            answers: [],

                            askedQuestions: [],

                            latestQuestion: null,

                            interviewCompleted: false

                        };

                        socket.emit(
                            'session_started',
                            {
                                message:
                                    'Interview session started successfully'
                            }
                        );

                    }

                    catch (err) {

                        console.error(
                            'Join session error:',
                            err
                        );

                        socket.emit(
                            'error',
                            {
                                message:
                                    'Failed to start interview session'
                            }
                        );

                    }

                }
            );

            // =========================
            // REQUEST QUESTION
            // =========================

            socket.on(
                'request_question',
                async () => {

                    try {

                        const session =
                            socket.session;

                        if (
                            session.interviewCompleted
                        ) {

                            return;

                        }

                        // =========================
                        // AI QUESTION GENERATION
                        // =========================

                        const aiResponse =

                            await aiClient.generateInterviewQuestions(

                                session.resumeContext,

                                session.targetRole,

                                session.history

                            );

                        // =========================
                        // INTERVIEW COMPLETE
                        // =========================

                        if (

                            aiResponse.question ===
                            '__INTERVIEW_COMPLETE__'

                        ) {

                            session.interviewCompleted =
                                true;

                            socket.emit(
                                'show_end_interview'
                            );

                            return;

                        }

                        let question =
                            aiResponse.question;

                        // =========================
                        // DUPLICATE PREVENTION
                        // =========================

                        let retryCount = 0;

while (

    session.askedQuestions.some(
        (q) =>

            q.toLowerCase().trim() ===
            question.toLowerCase().trim()
    )

    &&

    retryCount < 3

) {

    const retryResponse =

        await aiClient.generateInterviewQuestions(

            `
Resume Context:
${session.resumeContext}

Target Role:
${session.targetRole}

IMPORTANT:
The previous generated question was repetitive.

Generate a COMPLETELY DIFFERENT interview question.

Avoid:
- previously asked questions
- repeated technical challenge questions
- generic transitions

Focus on:
- different project areas
- architecture
- authentication
- database
- APIs
- teamwork
- debugging
- deployment
- scalability
- design decisions

Conversation History:
${JSON.stringify(session.history)}
            `,

            session.targetRole,

            session.history

        );

    question =
        retryResponse.question;

    retryCount++;

}

                        // =========================
                        // SAVE QUESTION
                        // =========================

                        session.latestQuestion =
                            question;

                        session.askedQuestions.push(
                            question
                        );

                        session.history.push({

                            role: 'ai',

                            content: question

                        });

                        // =========================
                        // SEND QUESTION
                        // =========================

                        socket.emit(
                            'receive_question',
                            {
                                question
                            }
                        );

                    }

                    catch (err) {

                        console.error(
                            'Question generation error:',
                            err
                        );

                        socket.emit(
                            'error',
                            {
                                message:
                                    'Failed to generate question'
                            }
                        );

                    }

                }
            );

            // =========================
            // SUBMIT ANSWER
            // =========================

            socket.on(
                'submit_answer',
                async ({ answer }) => {

                    try {

                        if (
                            !answer ||
                            !answer.trim()
                        ) {

                            socket.emit(
                                'error',
                                {
                                    message:
                                        'Answer cannot be empty'
                                }
                            );

                            return;

                        }

                        const session =
                            socket.session;

                        // =========================
                        // SAVE ANSWER
                        // =========================

                        session.answers.push(
                            answer
                        );

                        session.history.push({

                            role: 'user',

                            content: answer

                        });

                        // =========================
                        // EVALUATE ANSWER
                        // =========================

                        const evaluation =

                            await aiClient.evaluateAnswer(

                                session.latestQuestion,

                                answer,

                                session.resumeContext

                            );

                        session.evaluations.push({

                            question:
                                session.latestQuestion,

                            answer,

                            evaluation

                        });

                        socket.emit(
                            'answer_received',
                            {
                                success: true
                            }
                        );

                    }

                    catch (err) {

                        console.error(
                            'Answer evaluation error:',
                            err
                        );

                        socket.emit(
                            'error',
                            {
                                message:
                                    'Failed to process answer'
                            }
                        );

                    }

                }
            );

            // =========================
            // END INTERVIEW
            // =========================

            socket.on(
                'end_interview',
                async () => {

                    try {

                        const session =
                            socket.session;

                        // =========================
                        // NO ANSWERS
                        // =========================

                        if (
                            session.answers.length === 0
                        ) {

                            socket.emit(
                                'interview_completed',
                                {

                                    score: 0,

                                    communication_score: 0,

                                    confidence_score: 0,

                                    technical_depth_score: 0,

                                    clarity_score: 0,

                                    problem_solving_score: 0,

                                    strengths: [],

                                    improvements: [

                                        'Complete more interview questions to receive meaningful recruiter feedback.'

                                    ],

                                    feedback:
                                        'The interview ended before enough responses were provided.',

                                    answers: [],

                                    evaluations: []

                                }
                            );

                            return;

                        }

                        // =========================
                        // SCORE CALCULATION
                        // =========================

                        let totalScore = 0;

                        let communication = 0;

                        let confidence = 0;

                        let technical = 0;

                        let clarity = 0;

                        let problemSolving = 0;

                        session.evaluations.forEach(
                            (item) => {

                                const e =
                                    item.evaluation;

                                totalScore +=
                                    e.score || 0;

                                communication +=
                                    e.communication_score || 0;

                                confidence +=
                                    e.confidence_score || 0;

                                technical +=
                                    e.technical_depth_score || 0;

                                clarity +=
                                    e.clarity_score || 0;

                                problemSolving +=
                                    e.problem_solving_score || 0;

                            }
                        );

                        const count =
                            session.evaluations.length || 1;

                        // =========================
                        // DYNAMIC FEEDBACK
                        // =========================

                        const strengths = [

                            ...new Set(

                                session.evaluations.flatMap(

                                    item =>

                                        item.evaluation
                                            ?.strengths || []

                                )

                            )

                        ];

                        const improvements = [

                            ...new Set(

                                session.evaluations.flatMap(

                                    item =>

                                        item.evaluation
                                            ?.improvements || []

                                )

                            )

                        ];

                        const average =
                            totalScore / count;

                        let recruiterFeedback =
                            '';

                        if (average >= 8) {

                            recruiterFeedback =
                                'The candidate demonstrated strong technical depth, communication clarity, and practical implementation knowledge throughout the interview.';

                        }

                        else if (average >= 6) {

                            recruiterFeedback =
                                'The candidate showed good foundational understanding, but adding more implementation details and architectural reasoning would improve interview performance.';

                        }

                        else {

                            recruiterFeedback =
                                'The candidate should improve technical depth, confidence, and structured communication to perform better in technical interviews.';

                        }

                        // =========================
                        // FINAL REPORT
                        // =========================

                        const finalReport = {

                            score:
                                Number(
                                    (
                                        totalScore / count
                                    ).toFixed(1)
                                ),

                            communication_score:
                                Number(
                                    (
                                        communication / count
                                    ).toFixed(1)
                                ),

                            confidence_score:
                                Number(
                                    (
                                        confidence / count
                                    ).toFixed(1)
                                ),

                            technical_depth_score:
                                Number(
                                    (
                                        technical / count
                                    ).toFixed(1)
                                ),

                            clarity_score:
                                Number(
                                    (
                                        clarity / count
                                    ).toFixed(1)
                                ),

                            problem_solving_score:
                                Number(
                                    (
                                        problemSolving / count
                                    ).toFixed(1)
                                ),

                            strengths,

                            improvements,

                            feedback:
                                recruiterFeedback,

                            answers:
                                session.answers,

                            evaluations:
                                session.evaluations

                        };

                        console.log(
                            'FINAL REPORT:',
                            finalReport
                        );

                        socket.emit(
                            'interview_completed',
                            finalReport
                        );

                    }

                    catch (err) {

                        console.error(
                            'Final report generation error:',
                            err
                        );

                        socket.emit(
                            'error',
                            {
                                message:
                                    'Failed to generate final report'
                            }
                        );

                    }

                }
            );

            // =========================
            // DISCONNECT
            // =========================

            socket.on(
                'disconnect',
                (reason) => {

                    console.log(
                        `Socket disconnected: ${socket.id}, reason: ${reason}`
                    );

                    socket.session = null;

                }
            );

        }
    );

};