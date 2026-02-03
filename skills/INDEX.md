# Skill Index & Usage Map

## How to use this index
1.  Identify the **Task Type** you are performing.
2.  Load the **Primary Skill** immediately.
3.  Consult **Secondary Skills** if the task expands in scope.

## 1. Backend & Data
| Task Type | Primary Skill | Secondary Skills |
| :--- | :--- | :--- |
| **New Feature / Table** | `tenant-aware-data-layer` | `supabase-postgres-best-practices` |
| **Migration / Schema Change** | `tenant-aware-data-layer` | `deployment-cicd` |
| **Slow Query / Indexing** | `supabase-postgres-best-practices` | `tenant-aware-data-layer` |
| **Auth / User Session** | `supabase-auth` | `tenant-aware-data-layer` |

## 2. Frontend & UI
| Task Type | Primary Skill | Secondary Skills |
| :--- | :--- | :--- |
| **New Page / Component** | `forensic-ui` | `deployment-cicd` (Env vars) |
| **Modify Existing UI** | `forensic-ui` | - |
| **Upload / File Handling** | `forensic-ui` | `gemini-c2pa-pipeline` |

## 3. Core Engine (AI & Provenance)
| Task Type | Primary Skill | Secondary Skills |
| :--- | :--- | :--- |
| **Modify Analysis Logic** | `gemini-c2pa-pipeline` | `ROADMAP.md` (Check Tripwires) |
| **Prompt Engineering** | `gemini-c2pa-pipeline` | - |
| **C2PA Verification** | `gemini-c2pa-pipeline` | `forensic-ui` (Displaying trust) |

## 4. DevOps & Release
| Task Type | Primary Skill | Secondary Skills |
| :--- | :--- | :--- |
| **Prepare for Production** | `deployment-cicd` | `SOC 2 Compliance.md` (Doc) |
| **CI/CD Pipeline** | `deployment-cicd` | - |
| **Env Var Configuration** | `deployment-cicd` | `supabase-auth` |
