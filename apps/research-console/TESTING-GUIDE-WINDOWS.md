# KEY Research Console — Windows Testing Guide

This guide is written for a technical tester who understands systems, validation, and scripting but does not need to work as a software developer.

## What you need once

1. Windows 10 or 11.
2. GitHub Desktop.
3. Node.js LTS.
4. A modern browser such as Chrome or Edge.

## Part 1 — Install the prerequisites

### Install GitHub Desktop

Download and install GitHub Desktop, then sign in with the GitHub account that has access to the repository.

### Install Node.js LTS

Open Windows Terminal or PowerShell and run:

```powershell
winget install OpenJS.NodeJS.LTS
```

After installation, close and reopen Windows Terminal.

Confirm installation:

```powershell
node --version
npm --version
```

Both commands should return version numbers.

## Part 2 — Download the repository

1. Open GitHub Desktop.
2. Select **File > Clone repository**.
3. Choose the **URL** tab.
4. Enter:

```text
https://github.com/FreeThePython/key-foundation.git
```

5. Choose a local folder you can easily find.
6. Select **Clone**.

## Part 3 — Start KEY

1. In GitHub Desktop, select **Repository > Show in Explorer**.
2. Open the folder:

```text
apps\research-console
```

3. Double-click:

```text
START-KEY.cmd
```

The launcher will:

1. verify Node.js and npm
2. install dependencies on the first run
3. run the automated validation tests
4. open the browser
5. start the local KEY Research Console

Keep the command window open while testing.

The application should open at:

```text
http://localhost:3000
```

## Part 4 — Stop KEY

Return to the command window and press:

```text
Ctrl+C
```

Confirm termination if Windows asks.

You may then close the window.

## Part 5 — Run the first validation pass

### A. Startup validation

Confirm:

- the automated tests pass
- the browser opens
- the page loads without a blank screen
- Experience Mode is visible
- the scenario starts from the expected initial state

### B. Natural playthrough

1. Stay in Experience Mode.
2. Do not open Research Mode before completing the scenario.
3. Interact naturally.
4. Record immediate reactions in the notes field.
5. Pay particular attention to:
   - who you trust
   - what each person seems to want
   - whether the decision feels meaningful
   - whether reactions feel believable
   - whether consequences appear connected to your actions

### C. Research inspection

After the playthrough:

1. Open Research Mode.
2. Review character knowledge and beliefs.
3. Review trust and obligation changes.
4. Review the event ledger.
5. Confirm that each major consequence points to an earlier cause.
6. Note any mismatch between what you perceived and what the system recorded.

### D. Reset validation

1. Reset the scenario.
2. Confirm that time, resources, knowledge, relationships, and event history return to the same initial state.
3. Choose a materially different strategy.
4. Confirm that the later state diverges in more than wording.

## What to report

For each defect or concern, record:

```text
Title:
Build/commit:
Mode: Experience or Research
Starting state:
Steps to reproduce:
Expected result:
Actual result:
Repeatable: Yes / No / Not tested
Severity: Blocking / Major / Minor / Observation
Your interpretation:
Screenshot or console error:
```

## Common issues

### Windows says Node.js was not found

Install Node.js LTS, then restart Windows Terminal and run `START-KEY.cmd` again.

### Port 3000 is already in use

Close another development server using port 3000, or run this from Windows Terminal inside the research-console folder:

```powershell
npm run dev -- -p 3001
```

Then open:

```text
http://localhost:3001
```

### Dependency installation fails

From the research-console folder, run:

```powershell
npm cache verify
npm install
```

Then run `START-KEY.cmd` again.

### The browser opens before the server is ready

Wait several seconds and refresh the page.

### The page displays an application error

Copy the full error shown in the browser and the command window. Do not paraphrase it.

## Updating to the newest version

1. Stop KEY with `Ctrl+C`.
2. Open GitHub Desktop.
3. Select **Fetch origin** and then **Pull origin** if updates are available.
4. Double-click `START-KEY.cmd` again.

The launcher will reuse installed dependencies unless the project requires an update.
