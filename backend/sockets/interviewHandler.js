const aiClient = require('../services/aiClient');

module.exports = (io) => {
    const interviewNamespace = io.of('/interview');

    interviewNamespace.on('connection', (socket) => {
        console.log(`Socket connected to interview namespace: ${socket.id}`);

        // State kept in memory for simplicity (use Redis in prod for distributed systems)
        socket.history = [];
        socket.resumeContext = "";
        socket.targetRole = "";

        socket.on('join_session', async ({ resumeContext, targetRole }) => {
            console.log(`User joining session for role: ${targetRole}`);
            socket.resumeContext = resumeContext;
            socket.targetRole = targetRole;
            socket.history = [];
            
            socket.emit('session_started', { message: "Session started successfully." });
        });

        socket.on('request_question', async () => {
            try {
                // Fetch question from Python AI service
                const response = await aiClient.generateInterviewQuestions(
                    socket.resumeContext, 
                    socket.targetRole,
                    socket.history
                );
                
                const question = response.question;
                socket.history.push({ role: "ai", content: question });
                
                socket.emit('receive_question', { question });
            } catch (err) {
                console.error("Error generating question:", err);
                socket.emit('error', { message: "Failed to generate question" });
            }
        });

        socket.on('submit_answer', async ({ answer }) => {
            try {
                const latestQuestion = socket.history[socket.history.length - 1]?.content;
                socket.history.push({ role: "user", content: answer });

                // Evaluate the answer
                const evaluation = await aiClient.evaluateAnswer(
                    latestQuestion,
                    answer,
                    socket.resumeContext
                );

                socket.emit('evaluation_result', evaluation);
            } catch (err) {
                console.error("Error evaluating answer:", err);
                socket.emit('error', { message: "Failed to evaluate answer" });
            }
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};
