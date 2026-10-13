# MAC Arena — Interactive MAC Protocol Simulator

An interactive **Data Communication and Networking (DCN)** mini-project that simulates how multiple devices compete for access to a shared communication channel using Media Access Control (MAC) protocols.

MAC Arena provides a visual environment for exploring channel contention, packet transmission, collisions, retransmissions, and protocol performance through a real-time simulation.

---

## 1. Project Overview & Purpose

### Problem Context

Multiple devices sharing a communication channel must coordinate their transmissions to reduce collisions and use the available bandwidth efficiently. Different MAC protocols employ different strategies to manage channel access, resulting in different throughput, delay, and collision behavior.

### Solution

MAC Arena models a shared communication channel and allows users to interact with different MAC protocols. Users can adjust simulation parameters, observe device activity, and examine performance metrics to understand how each protocol behaves under different traffic conditions.

### Key Objectives

- Visualize communication over a shared channel.
- Demonstrate how collisions occur and how protocols respond.
- Explore retransmission and backoff mechanisms.
- Understand channel sensing and collision detection.
- Analyze packet delivery, throughput, and average delay.

---

## 2. Supported MAC Protocols

| Protocol | Channel Access Mechanism | Collision Handling |
|---|---|---|
| **Pure ALOHA** | Devices transmit whenever a packet is ready. | Collided packets are retransmitted after a random backoff. |
| **Slotted ALOHA** | Devices transmit only at predefined slot boundaries. | Collided packets retry in later slots after backoff. |
| **CSMA** | Devices sense the channel before transmitting. | Collisions may still occur because of propagation delay. |
| **CSMA/CD** | Devices sense the channel and monitor transmissions for collisions. | Collided transmissions are aborted, followed by a backoff before retrying. |

### Pure ALOHA

Devices transmit immediately when they have a packet ready, without checking whether the channel is busy. If transmissions overlap, a collision can occur.

### Slotted ALOHA

Time is divided into slots, and devices may begin transmitting only at slot boundaries. This reduces the vulnerable period for collisions compared with Pure ALOHA.

### CSMA — Carrier Sense Multiple Access

Devices listen to the channel before transmitting. If the channel is busy, they defer transmission according to the implemented access strategy. Collisions remain possible when multiple devices sense an apparently idle channel before their transmissions become visible to one another.

### CSMA/CD — Carrier Sense Multiple Access with Collision Detection

Devices sense the channel before transmitting and monitor the transmission for collisions. When a collision is detected, transmission is aborted and the device waits for a backoff interval before retrying.

---

## 3. Technology Stack

### Frontend

- **React** — Component-based user interface.
- **TypeScript** — Type-safe application and simulation logic.
- **Vite** — Development server and build tooling.
- **Tailwind CSS** — Interface styling.

### Simulation Engine

The simulation engine models device activity, channel access, packet transmission, collision events, retransmissions, and performance metrics.

The application runs in the browser and does not require a separate backend server.

---

## 4. Simulation Controls

The Simulation Lab provides controls for interacting with the simulation.

| Control | Purpose |
|---|---|
| **Protocol Selector** | Select the MAC protocol to simulate. |
| **Start** | Begin a simulation run. |
| **Pause** | Temporarily stop simulation advancement. |
| **Resume** | Continue a paused simulation. |
| **Reset** | Restore the simulation to its initial state. |
| **Step Forward** | Advance the simulation by one supported step. |
| **Device Count** | Configure the number of participating devices. |
| **Traffic Intensity** | Adjust how frequently devices generate packets. |
| **Simulation Speed** | Control the playback speed of the visualization. |

Available controls depend on the implementation in the current version of the application.

---

## 5. Performance Metrics

MAC Arena displays four primary performance metrics.

| Metric | Description |
|---|---|
| **Packets Delivered** | Total number of packets successfully delivered to the receiver. |
| **Collisions** | Number of collision events recorded by the simulation. |
| **Throughput** | Rate of successful packet delivery over simulated time. |
| **Average Delay** | Average time taken by successfully delivered packets, according to the simulation's timing model. |

### Understanding the Metrics

- **Packets Delivered:** Indicates how many packets completed successful transmission.
- **Collisions:** Helps reveal how channel contention changes with traffic intensity and protocol selection.
- **Throughput:** Shows how effectively the shared channel delivers packets.
- **Average Delay:** Indicates how long successful packets take to complete transmission, including the delays defined by the simulation model.

---

## 6. Network Visualization & Event Log

### Network Visualization

The network visualization represents devices competing for access to a shared communication channel.

Depending on the implemented simulation state, devices may appear idle, ready to transmit, transmitting, waiting, backing off, or involved in a successful transmission or collision.

The visualization helps users connect protocol behavior with the resulting channel activity.

### Event Log

The event log records simulation events such as:

- Packet generation.
- Channel sensing and access attempts.
- Transmission starts.
- Collision events.
- Retransmission and backoff.
- Successful packet delivery.

The event log is intended to help users understand why a transmission succeeds, fails, or must be retried.

---

## 7. Project Structure

The project separates reusable interface components from the simulation engine and individual protocol implementations.

```text
MAC-Lab/
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   └── LiveCharts.tsx
│   │   ├── layout/
│   │   │   └── Navbar.tsx
│   │   ├── logs/
│   │   │   └── EventLog.tsx
│   │   ├── metrics/
│   │   │   └── MetricCards.tsx
│   │   ├── network/
│   │   │   ├── NetworkCanvas.tsx
│   │   │   └── Legend.tsx
│   │   └── simulation/
│   │       ├── ProtocolBanner.tsx
│   │       └── SimulationControls.tsx
│   ├── hooks/
│   │   └── useSimulation.ts
│   ├── pages/
│   │   └── SimulationLab.tsx
│   ├── simulation/
│   │   ├── protocols/
│   │   │   ├── pureAloha.ts
│   │   │   ├── slottedAloha.ts
│   │   │   ├── csma.ts
│   │   │   └── csmaCd.ts
│   │   ├── channel.ts
│   │   ├── devices.ts
│   │   ├── engine.ts
│   │   ├── metrics.ts
│   │   ├── packets.ts
│   │   └── random.ts
│   ├── types/
│   │   └── simulation.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Directory Overview

| Directory or File | Responsibility |
|---|---|
| `components/charts/` | Simulation charts and data visualization. |
| `components/layout/` | Application navigation and layout. |
| `components/logs/` | Simulation event log. |
| `components/metrics/` | Performance metric cards. |
| `components/network/` | Network visualization and legend. |
| `components/simulation/` | Protocol information and simulation controls. |
| `hooks/` | React hooks for simulation state and interaction. |
| `pages/` | Main Simulation Lab page. |
| `simulation/protocols/` | Individual MAC protocol implementations. |
| `simulation/` | Channel, devices, packets, metrics, random number generation, and simulation engine. |
| `types/` | TypeScript types and interfaces. |
| `App.tsx` | Main application component. |
| `main.tsx` | Application entry point. |
| `index.css` | Global styling. |

---

## 8. Getting Started

### Prerequisites

Install the following tools before running the project:

- [Node.js](https://nodejs.org/)
- npm, included with Node.js

### 1. Clone the Repository

```bash
git clone https://github.com/Tejal-N/MAC-Lab.git
```

### 2. Navigate to the Project Directory

```bash
cd MAC-Lab
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

---
