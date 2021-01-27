This is the base template to create microservice azure function app project.
What we get out of this template
1) Basic set up which can help to set up azure pipeline and create required azure resources for the project.
2) Health check URL
3) Common code to access key vault, app configuration from azure.
4) Common frameworks like logging ,exception framework.
5) Node-typescript coding standards.
6) Jest framework integration for unit testing.
7) Application insight configuration.
8) Inversify integration for inversion of control (IoC) container for TypeScript and JavaScript apps.
9) Webpack configuration.

NOTE:- HealthCheck URL is just a base url. Please change that to project specific.
Ex-v1/health-check needs to be change to <<Project_base_Path>>/v1/health-check -> wires-bmo/v1/health-check

Add below enteries to local.settings.json file to get functionapp up and running
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "FUNCTIONS_V2_COMPATIBILITY_MODE": "true",
    "APPINSIGHTS_INSTRUMENTATIONKEY": "123-345",
    "environment":"local",
    "LOG_LEVEL": "DEBUG"
  }
}



Please refer below confluence links for more details.
https://fairway.atlassian.net/wiki/spaces/APPDEV/pages/470089733/Setting+up+Azure+Functions+with+NodeJS
https://fairway.atlassian.net/wiki/spaces/APPDEV/pages/483721231/Microservices+Architecture
https://fairway.atlassian.net/wiki/spaces/APPDEV/pages/500793474/Serverless+Microservices+-+Fairway+Projects
https://fairway.atlassian.net/wiki/spaces/APPDEV/pages/503185525/Azure-NodeJs+application+Stacks
https://fairway.atlassian.net/wiki/spaces/APPDEV/pages/604569763/Exception+Framework-+nodeJs+Azure+Functions
https://fairway.atlassian.net/wiki/spaces/APPDEV/pages/1095270454/Logging+using+Appinsight+in+Azure+Functions

