# medical-metadata
The following project is a proof of concept of my master's thesis, written at Alpen-Adria-Universität in the topic "Medical Metadata Development" in 2022. The stack is: Vue.JS, nodeJS, postgreSQL, openAPI 3.0, everything is dockerized.

The written part of the thesis can be found on the university webpage: https://netlibrary.aau.at/obvuklhs/content/titleinfo/7771131

# **Docker**

After pulling a copy of the project to the local machine, the following command is to be run in the project root folder. To do so the docker and docker-compose has to be installed on the local machine. In desktop installs the docker-compose is part of the docker installation. I work with docker desktop V.3.2.1
`docker-compose up --build -d`
This command will set up the frontend (on port 8081), the backend (on port 3001) + API documentation (on port 80), the database (on port 5432), the pgAdmin (on port 5050) and also will populate the database with initial data and lastly it also sets up a common network where all the above mentioned components can communicate.

Currently the project points on files / folders on the local machine from inside the containers, so a build is not needed after the first run for backend. Both the backend and the frotend is stared via nodemon, saved changes will automatically result in restart the backend server and the changes are effective inmediately inside the docker container too.

To tear down every running docker container execute the command (Caution! You'll have to re-build the containers at the next start and all your session-data is going to be lost): `docker-compose down`
To stop the running containers use (data and builds are kept): `docker-compose stop`

# **API doc**

After the docker compose command is executed, also a swaggerui container is created for the API documentation (running on an nginx server)
`loclahost:80`
More info about the swaggerui container https://hub.docker.com/r/swaggerapi/swagger-ui

# **Database**

The database adminisration tool pgAdmin v4.3 is running on
`localhost:5050`
Log in with the following data:

- e-mail: pgadmin4@pgadmin.org
- password: admin

Once inside pgAdmin, make a new server connection ( Servers -> create -> server ):

- General-> name: can be picked freely
- Connection -> Host/Name addres: `postgres` (the network name from docker-compose.yaml)
- Connection -> Port: `5432`
- Connection -> Username: `postgres`
- Connection -> Password: `admin`

Now the database schema is to be seen with populated data tables.

During my work I needed to assess data table backups whic hwere created by pgAdmin.
Exported data table contents via pgAdmin can be found inside the pgAdmin container, under: `/var/lib/pgadmin/storage/pgadmin4_pgadmin.org`
Copy the export from the container to localhost: `docker cp container_id://var/lib/pgadmin/storage/pgadmin4_pgadmin.org/export.tsv export.tsv`

# **Frontend**

The frontend is running on `localhost:8081`
On the top of vue JS, the vuetify framework is used in this part of the project.
There are thee main sections on the frontend:

- datainfo:
	- based on the original urinary dataset, further datasets can be created with randomized different schemas
	- datasets from external sources can be loaded into the system
- metadata manager
	- based on the scaling of the data properties the settings for the metadata model can be done 
	- metadata model can be loaded into the system from external sources
	- Create Composite content descriptors
- search: 
	- LOINC codes as collection descriptors
	- LOINC Part Value as search value
	- Composite collection descriptor search
	- Collection quality based search
	- Collection content based search

# **Backend**

The fhir_shell.sh file is not uploaded to the git repository because it contains my personal credentials to the FHIR service and I do no have a service user.
When the project is cloned to one's localhost, the following file is to be created (prerequsite is a LOINC account) path: backend/helpers/shell/fhir_shell.sh

Note: Executing requests via CURL was needed as a work-around for the CORS policy of the LOINC - FHIR API.

Content of the file:

```shell
export USER=<USER>
export PASS=<PASS>
curl -i -H "Accept: application/json" -u $USER:$PASS 'https://fhir.loinc.org/CodeSystem/$lookup?system=http://loinc.org&code='$1
```

Debugging: by default the app's backend container is started with its debugging port 9229 open. You can attach a debugger to this port and forward it to your local port of choice. In the launch.json file there is a pre-defined debugger configuration for VS Code (port 9229). Caution: open debugging ports are okay for development purposes but should not be open in any production environment.

# **License**
MIT

Copyright (c) 2022 Bence Slajchó

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.