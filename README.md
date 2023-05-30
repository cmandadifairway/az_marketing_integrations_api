# Marketing Integrations API.

### What is this repository for?

-   Quick summary: This repo holds the endpoints for getDeltas and SendDeltasEmail.
    getDeltas: Compares source and target data and returns deltas.
    sendDeltasEmail: Composes deltas in email format and sends email to subscribers.
    This code is written in Node js using Azure Function App.
-   Version: 1.0.0

### How do I get set up?

-   To get started, install VS Code with Azure Functions extension and clone or fork this repo.
-   Get access to Azure function apps in azure portal
-   Setup local.settings.json with all application variables required (Check configuration section on azure portal for this function app
    or check Config.helper.ts file)
-   There are not many test cases available for this project
-   To deploy this project, an azure devops pipeline (https://dev.azure.com/fairwaymtg/development/_build?definitionId=281) has been created,
    which deploys to dev whenever we push code to this repo.

## License

Fairway Independnet Mortgage

## How to link Work item?

-   git commit -m "CST-301 <message>"
-   It should be in capital letters. Here CST-301 is your JIRA Ticket number
