# Simple Notes app front end

This repository contains the front end for a simple Notes application.
Before using this repo, set up the backend first. The back end is found [here](https://github.com/NikolayKolov/devteams-notes-server).

The front end is written in TypeScript and uses React 18, Material UI 5, React Router V6 for client side routing, [SWR](https://swr.vercel.app/) for data fetching and caching, [Zod](https://zod.dev/) for form data validation.

The user must be logged in to access the interface to create, edit and delete notes. Each user has access to only the notes he has created.
The notes can be of 2 types - text or checklist.
SWR library uses the SWRConfig cache to determine if data needs to be refetched - for example on component mount, not just on refresh interval.

Both the frontend and the backend run on the same server (localhost) and must be run on the same machine.
The frontend uses a proxy setting in the vite.config.ts file to communicate with the backend on localhost.
These settings must be changed for a production deployment and the backend and frontend don't need to run on the same server, depending on chosen host (cloud/web server).

The folder structure for the project should be: a main folder named /Notes, and in it 2 folders: /server and /client.
Set up the back end and fron end in the /server and /client folders accordingly.

## Project set-up

1. Set up the back end first.
2. Set up a folder stucture for the project, if you haven't already:
  - Create a main folder, for example /Notes.
  - Set up the backend in a folder /Notes/server, for example.
  - Create a folder /Notes/client for the frontend.
3. Copy or clone the repo in the frontend folder.
3. Test if you have NodeJS installed.
  - In Command Prompt, type 'node -v' and execute. If an error appears, go to [this site](https://nodejs.org/) and install latest stable version from there.
4. Open the frontend folder with Visual Studio code, and open a terminal and execute command 'npm install'.
5. Open the NPM Scripts menu on the bottom left part and run the script 'dev', or type 'npm run vite'.
6. Open the displayed URL (localhost:5173) in browser.


## Project set-up with Docker
1. Set up a Postgres database in either localhost or remote server.
2. Set up appropriate env files in backend and frontend. (See Readme in server folder and sample env files)
3. Open main project folder.
4. Run command "docker compose up -d".
5. Open "localhost" in your browser to view app.

The default compose.yaml file runs the app with 2 containers in bridge network mode.
The compose-proxy.yaml file runs the app with 3 containers, one of which is an nginx proxy that relays traffic between the fronend and backend. More advanced configuratiosn can spin up multiple backend containers and use the nginx proxy server as a load balancer between them. The fronend is lightweight and doesn't realistically need a load balancer.

This is not used when deploying to the cloud, as cloud providers provide their own advanced load balancers with auto scalers.
Use when deploying on an own web server/local testing with docker compose.