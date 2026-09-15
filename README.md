# Microservice Chat Application

- Real-time chat app built with a microservice architecture
- Separate User, Chat, and Mail services with a Next.js frontend

## Features

- Email OTP login with **JWT authentication**
- OTP expiry and rate limiting with **Redis**
- OTP emails sent asynchronously through **RabbitMQ**
- Real-time messaging, online status, typing indicators, and read receipts
- Image sharing with **Cloudinary**

## Architecture

- **User Service**: handles login, OTPs (Redis), and user profiles
- **Mail Service:** receives OTP messages from RabbitMQ and sends emails
- **Chat Service:** handles chats and real-time messaging with Socket.IO
- **Frontend:** Next.js app that talks to the User and Chat services

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Messaging:** RabbitMQ, Socket.IO
- **Data:** MongoDB, Redis
- **Other:** JWT, Cloudinary
