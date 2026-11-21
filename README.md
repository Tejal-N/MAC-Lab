# Interactive Simulator for Media Access Control Protocols and Network Performance Analysis

An interactive **Data Communication and Networking (DCN)** mini-project that simulates how multiple devices compete for access to a shared communication channel using Media Access Control (MAC) protocols.

MAC Lab provides a visual environment for exploring channel contention, packet transmission, collisions, retransmissions, protocol performance, and comparative analysis through a real-time simulation.

---

## 1. Project Overview & Purpose

### Problem Context

Multiple devices sharing a communication channel must coordinate their transmissions to reduce collisions and use available bandwidth efficiently. Different MAC protocols employ different strategies to manage channel access, resulting in varying throughput, delay, and collision behavior.

### Solution

MAC Lab models a shared communication channel and allows users to interact with different MAC protocols. Users can adjust simulation parameters, observe device activity, and examine performance metrics to understand how each protocol behaves under different traffic conditions.

The project also includes a **Protocol Analysis** feature that runs independent simulations of all four supported protocols under the same network configuration, enabling direct performance comparison.

### Key Objectives

- Visualize communication over a shared channel.
- Demonstrate how collisions occur and how protocols respond.
- Explore retransmission and backoff mechanisms.
- Understand channel sensing and collision detection.
- Analyze packet delivery, throughput, and average delay.
- Compare the performance of multiple MAC protocols under identical simulation conditions.

---

## 2. Supported MAC Protocols

| Protocol | Channel Access Mechanism | Collision Handling |
|---|---|---|
| **Pure ALOHA** | Devices transmit whenever a packet is ready. | Collided packets are retransmitted after a random backoff. |
| **Slotted ALOHA** | Devices transmit only at predefined slot boundaries. | Collided packets retry in later slots after backoff. |
| **CSMA** | Devices sense the channel before transmitting. | Collisions may still occur because of propagation delay. |
| **CSMA/CD** | Devices sense the channel and monitor transmissions for collisions. | Collided transmissions are aborted, followed by backoff before retrying. |

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
- **Recharts** — Performance charts and data visualization.
- **Lucide** — Interface icons.

### Simulation Engine

The simulation engine models:

- Device activity and packet generation.
- Channel access decisions.
- Packet transmission.
- Collision detection and handling.
- Retransmissions and backoff.
- Performance metric calculations.
- Simulation time progression.

The application runs entirely in the browser and does not require a separate backend server.

---

## 4. Simulation Lab

The Simulation Lab provides an interactive environment for exploring the behavior of individual MAC protocols.

### Simulation Controls

| Control | Purpose |
|---|---|
| **Protocol Selector** | Select the MAC protocol to simulate. |
| **Start** | Begin the simulation. |
| **Pause** | Temporarily stop simulation advancement. |
| **Resume** | Continue a paused simulation. |
| **Reset** | Restore the simulation to its initial state. |
| **Step Forward** | Advance the simulation by one time unit. |
| **Device Count** | Configure the number of participating devices. |
| **Traffic Intensity** | Adjust the packet arrival rate. |
| **Simulation Speed** | Control the playback speed of the visualization. |
| **CSMA Persistence** | Select the available CSMA persistence strategy where applicable. |

Available controls depend on the implementation in the current version of the application.

### Live Network Visualization

The network canvas visually represents devices competing for access to a shared communication channel.

It allows users to observe:

- Device states.
- Packet transmission activity.
- Channel occupancy.
- Collision behavior.
- Successful packet delivery.
- Backoff and waiting states.

### Live Throughput Telemetry

The simulation includes a live throughput chart that tracks throughput progression over simulation time.

The chart helps users observe how channel performance changes as packets are generated, transmitted, collided, and successfully delivered.

---

## 5. Protocol Analysis

The Protocol Analysis feature allows users to evaluate and compare all four supported MAC protocols without manually switching between individual simulations.

### How It Works

- Creates independent simulations for all four protocols.
- Uses the same network configuration for each simulation.
- Uses the same packet-arrival random seed for comparable packet-generation patterns.
- Runs each simulation for the configured simulation duration.
- Collects performance metrics from each simulation.
- Displays the results in a comparison chart and table.

### Protocols Compared

- Pure ALOHA
- Slotted ALOHA
- CSMA
- CSMA/CD

### Comparison Metrics

| Metric | Description |
|---|---|
| **Packets Delivered** | Number of packets successfully delivered during the simulation. |
| **Throughput** | Normalized successful channel time relative to simulated time. |
| **Collision Rate** | Ratio of recorded collided attempts to total transmission attempts. |
| **Average Delay** | Average delivery delay for successfully delivered packets. |

### Throughput Comparison Chart

A bar chart compares the throughput achieved by each protocol under the same network configuration.

### Performance Comparison Table

The comparison table displays:

- Protocol name.
- Successful packet deliveries.
- Throughput.
- Collision rate.
- Average packet delay.

The best-performing result for each comparison metric is highlighted to make differences between protocols easier to identify.

### Running a Comparison

1. Open the Simulation Lab.
2. Configure the network parameters.
3. Scroll to the Protocol Analysis section.
4. Click **Run Comparison**.
5. Observe the throughput chart and performance table.

The comparison runs independently and does not replace the current live simulation.

---

## 6. Performance Metrics

MAC Lab displays the following primary performance metrics during an individual simulation.

| Metric | Description |
|---|---|
| **Packets Delivered** | Total number of packets successfully delivered to the receiver. |
| **Collisions** | Number of recorded collision attempts. |
| **Throughput** | Normalized successful channel time relative to simulated time. |
| **Average Delay** | Average time taken by successfully delivered packets according to the simulation's timing model. |

### Understanding the Metrics

- **Packets Delivered:** Indicates how many packets completed successful transmission.
- **Collisions:** Helps reveal how channel contention changes with traffic intensity and protocol selection.
- **Throughput:** Shows how effectively the shared channel delivers packets.
- **Average Delay:** Indicates how long successfully delivered packets take to complete transmission, including the delays defined by the simulation model.

---

## 7. Network Visualization & Event Log

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

The event log helps users understand why a transmission succeeds, fails, or must be retried.

---

## 8. Project Structure

The project separates reusable interface components from the simulation engine and individual protocol implementations.

```text
MAC-Lab/
├── src/
│   ├── components/
│   │   ├── analysis/
│   │   │   └── ProtocolAnalysis.tsx
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
| `components/analysis/` | Protocol comparison chart and performance analysis. |
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

## 9. Getting Started

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

Open the local URL displayed in the terminal to access MAC Lab.

---
