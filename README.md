# CivicConnect Core API (Wonderpark Estates)

**Course:** SEN381 - Milestone 2 (Architecture & Foundation)  
**System:** Residential Service Ticketing System (Backend Monolith)

## Project Overview
CivicConnect replaces Wonderpark Estates' fragmented WhatsApp and logbook fault-reporting methods with a centralized, auditable ticketing queue. This repository contains the Node.js/Express core engine that processes requests, enforces role-based access control, and executes design pattern logic (Observer and Factory) for status notifications.

## Technology Stack (ADR-STACK1)
* **Runtime:** Node.js (v24 LTS)
* **API Framework:** Express.js (REST API Boundary)
* **Persistence:** PostgreSQL (via Supabase) - *Pending M3 Integration*
* **Architecture:** Modular Monolith with Layered Separation

## Local Setup & Run Instructions
1. **Clone the repository:**
   ```bash
   git clone https://github.com/jk29364/CivicConnect-SEN381
   cd civicconnect-backend

   npm install
