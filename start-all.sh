#!/bin/bash

# Start all services in debug mode

PROJECT_ROOT="$(dirname "$0")"

echo "Starting all services in DEBUG mode..."
echo "Project root: $PROJECT_ROOT"
echo ""

# Start services in separate background processes with debug ports
(cd "$PROJECT_ROOT/backend/chat" && npm run dev:debug) &
CHAT_PID=$!

(cd "$PROJECT_ROOT/backend/user" && npm run dev:debug) &
USER_PID=$!

(cd "$PROJECT_ROOT/backend/mail" && npm run dev:debug) &
MAIL_PID=$!

(cd "$PROJECT_ROOT/frontend" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "✓ Chat Service started (PID: $CHAT_PID) - Port: 5002, Debug: 9230"
echo "✓ User Service started (PID: $USER_PID) - Port: 5000, Debug: 9229"
echo "✓ Mail Service started (PID: $MAIL_PID) - Port: 5001, Debug: 9231"
echo "✓ Frontend started (PID: $FRONTEND_PID)"
echo ""
echo "Debugger ports available:"
echo "  - Attach to Chat: 9230"
echo "  - Attach to User: 9229"
echo "  - Attach to Mail: 9231"
echo ""
echo "Press Ctrl+C to stop all services."
echo ""

# Wait for all background processes
wait
