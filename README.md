# Node Function App Template

## How to use

1. [Fork this repo as your own project](https://fairway.atlassian.net/wiki/spaces/DEVOPS/pages/21069887/Fork+an+Existing+Repo)

2. Replace the contents of the code folder with your own project specific source code.

3. Be sure to include a simple GET http trigger health check function at the route /api/healthcheck that responds with 200OK. Sample code is included in this template repo.

4. [Refer to the terraform specific readme for more instructions on updating the terraform](/tf/README.md)

5. Replace this README.md with your own README.md. [Here is a sample template that I like.](https://gist.github.com/akashnimare/7b065c12d9750578de8e705fb4771d2f#file-readme-md)

6. [Create Azure DevOps Pipeline with the azure-pipelines.yaml file located in the root of the repository](https://fairway.atlassian.net/wiki/spaces/DEVOPS/pages/76054581/Build+Pipeline+from+Template)



## Azure Resources

Running this pipeline will create the following resources with the approved [naming convention](https://fairway.atlassian.net/wiki/spaces/sysarch/pages/147685462/Naming+Convention):

- Resource Group: rg-fim-infapp-dev-cus-[ffadmin]
- App Service Plan: fn-fim-infapp-dev-cus-[ffadmin]-plan
- Function App: fn-fim-infapp-dev-cus-[ffadmin]
- Blob Storage: sainfappdevcus[ffadmin]
- Key Vault: kv-infapp-dev-[ffadmin]
- Application Insights: ai-fim-infapp-dev-cus-[ffadmin]

### Environment Variables

The following environment variables will be available from the function application

| Name                                     | Description                                                  | Example                                              |
| ---------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| environment                              | Environment abbreviation                                     | dev                                                  |
| APPINSIGHTS_INSTRUMENTATIONKEY           | The instrumentation key identifies the resource that you want to associate your telemetry data with for application insights. |                                                      |
| KEY_VAULT_URL                            | The URL to the key vault created with your project           | https://kv-infapp-dev-[ffadmin].vault.azure.net |
| WEBSITE_CONTENTAZUREFILECONNECTIONSTRING | The connection string for the storage account created with your project |                                                      |
| LOG_LEVEL                                | Logging level                                                | DEBUG                                                |

## Pipeline

The Azure DevOps Pipeline is designed to build, test, and publish the source code located in the code folder. After successful creation of the build artifact the subsequent release pipelines will run.

#### Triggers:

We use push triggers to start the continuous integration builds. Pull request triggers are disabled because once the PR has been merged to a branch the push trigger will execute .  We leverage batching due to the potential of state locking issues with terraform. This means that a new build will not start if one is already running, it will instead batch the subsequent commits and run them together in a single build.

```
pr: none
trigger:
  branches:
    include:
    - master
    - develop
    - feature/*
  paths:
    exclude:
    - README.md
    - tf/README.md
  batch: true
```



#### Stages:

A stage is a collection of related jobs. Stages are a good way to deploy to multiple environments with different parameters.

1. Build - This requires that the source control commit was to one of the branches listed under [triggers](#Triggers:)
2. Release_Development - This requires that the pipeline was triggered from the develop or master branch.
3. Release_Production - This requires that the pipeline was triggered from the master branch. This stage requires approval from ITOPS.

#### Templates:

- [build-job.yaml](/templates/build-job.yaml)
- [deploy.yaml](templates/deploy.yaml)

#### Parameters:

##### Build:

| Name                 | Description                                                  | Example     |
| -------------------- | ------------------------------------------------------------ | ----------- |
| servicename          | Name of the Resource/Service being deployed                  | impact      |
| npm_command          | Runs [npm ci](https://preview-docs.npmjs.com/cli-commands/npm-ci) in build pipeline. | ci          |
| artifactory_endpoint | Azure DevOps Service Connection Name for Artifactory         | Artifactory |

##### Deploy:

| Name        | Description                                                  | Example                                                      |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| job_name    | Name of the deployment job to be shown when pipeline is running | Deploy_Dev                                                   |
| ServiceName | Name of the Resource/Service being deployed                  | impact                                                       |
| svc_conn    | The Azure DevOps service connection to be used for deployment | IT Infrastructure Apps Dev (6213e05a-d0ed-4bcb-8ba9-e7c32d78b201) |
| env         | Deployment Environment Target                                | dev                                                          |
| group       | The Azure DevOps variable group to be used during the deployment process | InfraVar-Dev                                                 |

#### Variables:

Some variables are predefined variables from Microsoft that we leverage for pipeline tasks. Please see the [references](#Azure DevOps References:) below for more details on those variables.

##### Deploy:

| Name                       | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| AZDO--BACKEND--STORAGEACCT | This variable is stored in Azure Key Vault and is used to access the terraform state storage |
| AZDO--BACKEND--ACCESSKEY   | This variable is stored in Azure Key Vault and is used to access the terraform state storage |
| AZDO--SUB--CS              | This variable is stored in Azure Key Vault and contains the client secret for the service principal used for terraform execution. |
| OP_FUNCAPP_NAME            | This is a dynamic variable that is created from terraform outputs that is used to deploy the build artifact to the function app created with the pipeline. |



#### Azure DevOps References:

[Azure Pipelines Yaml Schema](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema?view=azure-devops&tabs=schema%2Cparameter-schema)

[Predefined Variables Used in the Pipeline](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=yaml)

