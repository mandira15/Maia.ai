# 🧠 MAIA's Hybrid AI Architecture

MAIA uses a **network-aware hybrid AI architecture** to provide maternal-health information across different connectivity conditions.

Instead of depending entirely on a cloud-based Generative AI model, MAIA dynamically selects between two response mechanisms:

```text
                         ┌─────────────────────┐
                         │     User Query      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Network Condition   │
                         │      Detection      │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
             Good Connectivity              Poor Connectivity
                    │                               │
                    ▼                               ▼
          ┌──────────────────┐             ┌──────────────────┐
          │   Cloud GenAI    │             │  Local RAG Model │
          │      / LLM       │             │  + Local KB      │
          └────────┬─────────┘             └────────┬─────────┘
                   │                                │
                   │                                │
                   └───────────────┬────────────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │     Response        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       User          │
                         └─────────────────────┘
```

## ☁️ Mode 1 — Good Connectivity

When a stable internet connection is available, MAIA routes the user's query to a **Generative AI model**.

The cloud-based model provides more flexible natural-language generation and can handle a broader range of general maternal-health questions.

```text
User Query
    │
    ▼
Network Check
    │
    ▼
Good Connection
    │
    ▼
Backend API
    │
    ▼
Generative AI / LLM
    │
    ▼
Response
    │
    ▼
User
```

This mode provides the most capable conversational experience.

---

# 📡 Mode 2 — Poor / Low Connectivity

When the network is unavailable, unstable, or sufficiently poor, MAIA avoids relying on a cloud LLM.

Instead, the application uses a **lightweight local Retrieval-Augmented Generation (RAG) pipeline** backed by a locally available maternal-health knowledge base.

```text
User Query
    │
    ▼
Network Check
    │
    ▼
Poor / Limited Connection
    │
    ▼
Local RAG Pipeline
    │
    ├── Query Processing
    │
    ├── Local Retrieval
    │
    ├── Relevant Knowledge
    │
    └── Lightweight Generation
    │
    ▼
Response
    │
    ▼
User
```

The purpose of this mode is to keep MAIA useful even when a reliable connection to the cloud AI service cannot be established.

---

# 🔀 Network-Aware Routing

The central component of MAIA's architecture is the **network-aware routing layer**.

Conceptually:

```text
if network_quality >= threshold:
        use Cloud GenAI
else:
        use Local RAG
```

The routing layer determines which inference path should handle the query.

This creates a hybrid system:

```text
                     MAIA AI Layer
                           │
               ┌───────────┴───────────┐
               │                       │
               ▼                       ▼
        Cloud Intelligence       Local Intelligence
               │                       │
          GenAI / LLM              Local RAG
               │                       │
               ▼                       ▼
        Better flexibility       Connectivity
                                independence
```

---

# 🧩 Complete MAIA Architecture

The overall system can therefore be represented as:

```text
┌──────────────────────────────────────────────────────────┐
│                         MAIA                             │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                   React / PWA                      │  │
│  │                                                    │  │
│  │  Chat UI • User Interaction • Network Detection   │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                              │
│                           ▼                              │
│              ┌────────────────────────┐                 │
│              │   AI Routing Layer     │                 │
│              │                        │                 │
│              │ Network-aware Decision │                 │
│              └────────────┬───────────┘                 │
│                           │                              │
│                ┌──────────┴──────────┐                   │
│                │                     │                   │
│          Good Network           Poor Network             │
│                │                     │                   │
│                ▼                     ▼                   │
│       ┌────────────────┐    ┌────────────────────┐       │
│       │   Backend API  │    │    Local RAG       │       │
│       └───────┬────────┘    │                    │       │
│               │             │ Local Knowledge    │       │
│               ▼             │ Base + Retrieval   │       │
│       ┌────────────────┐    └─────────┬──────────┘       │
│       │ Cloud GenAI    │              │                  │
│       │     / LLM      │              │                  │
│       └───────┬────────┘              │                  │
│               │                       │                  │
│               └───────────┬───────────┘                  │
│                           ▼                              │
│                    Unified Response                     │
│                           │                              │
│                           ▼                              │
│                         User                            │
└──────────────────────────────────────────────────────────┘
```

---

# 🤖 AI Pipeline

MAIA's AI pipeline consists of two complementary inference paths.

## Cloud GenAI Pipeline

```text
Query
  ↓
Network Validation
  ↓
Backend
  ↓
Context / Prompt Construction
  ↓
Cloud LLM
  ↓
Response
```

The cloud path is useful when connectivity is sufficient because a larger generative model can provide more flexible responses.

---

## Local RAG Pipeline

```text
Query
  ↓
Network Validation
  ↓
Local Query Processing
  ↓
Embedding / Retrieval
  ↓
Local Maternal Health Knowledge Base
  ↓
Relevant Context
  ↓
Lightweight Local Generation
  ↓
Response
```

The local path prioritizes **availability and low-connectivity usability** over the broader capabilities of a cloud LLM.

---

# 📚 Local Knowledge Base

The local RAG component relies on a curated maternal-health knowledge base containing information relevant to the intended low-level query scope.

The retrieval process follows:

```text
User Query
     │
     ▼
Query Representation
     │
     ▼
Similarity Search
     │
     ▼
Local Knowledge Base
     │
     ▼
Relevant Documents / Chunks
     │
     ▼
Local Generation
     │
     ▼
Answer
```

This allows MAIA to answer supported queries without requiring a round trip to a cloud AI service.

---

# 🌐 Connectivity-Aware Design

MAIA is designed around the assumption that **internet connectivity is not always consistent**.

Rather than implementing a simple:

```text
Internet → AI
No Internet → Nothing
```

architecture, MAIA provides two levels of intelligence:

```text
┌───────────────────────────────┐
│      Strong Connectivity      │
│                               │
│        Cloud GenAI            │
│     Broad AI capabilities     │
└───────────────────────────────┘

              ↓

┌───────────────────────────────┐
│      Poor Connectivity        │
│                               │
│      Local RAG + KB           │
│   Essential query support     │
└───────────────────────────────┘
```

This makes the application more resilient to changing network conditions.

---

# 🎯 Current AI Scope

The current version of MAIA focuses on **low-level/general maternal-health queries**.

Examples include:

* General pregnancy information
* Pregnancy-stage questions
* Basic nutrition-related questions
* General maternal wellness information
* Common informational queries

MAIA is **not currently designed as a diagnostic or clinical decision-support system**.

---

# ⚠️ AI Safety Boundary

MAIA's AI system is designed to provide **general informational assistance**, not medical diagnosis.

The system should not be interpreted as:

* A doctor
* A diagnostic system
* A prescription system
* An emergency response service

For serious or urgent medical concerns, users should seek professional medical care.

The local RAG path also operates within a **limited, curated knowledge scope**, rather than attempting to reproduce the capabilities of a full cloud LLM.

---

# 🛠️ Updated Technology Stack

### Frontend

* React.js
* JavaScript
* Responsive UI
* Progressive Web App technologies
* Network/connectivity detection

### Backend

* Node.js
* Express.js
* REST APIs

### Cloud AI

* Generative AI / LLM API
* Context-aware prompting

### Local AI

* Lightweight local RAG pipeline
* Local maternal-health knowledge base
* Local retrieval
* Lightweight generation

### Database

* MongoDB / MongoDB Atlas, where persistence is required

---

# 🚀 What Makes MAIA Different?

The key idea behind MAIA is **not simply using AI for maternal-health questions**.

Its differentiator is the ability to adapt the AI layer to the user's connectivity:

> **Strong network → more capable cloud GenAI**
>
> **Poor network → local RAG-based assistance**

This allows MAIA to explore a practical trade-off between:

**AI capability ↔ availability ↔ connectivity**

rather than assuming that every user has a stable internet connection.

---

# 🔮 Future Roadmap

Potential future improvements include:

* More comprehensive local maternal-health knowledge base
* Improved local retrieval
* Better lightweight generation models
* Multilingual local RAG
* Pregnancy-stage-aware retrieval
* Improved network-quality estimation
* Seamless switching between local and cloud inference
* Source citations for retrieved medical information
* Stronger safety filtering
* More rigorous evaluation of AI responses

These features can progressively improve MAIA's reliability while preserving its connectivity-aware architecture.
