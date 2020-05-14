# service-name Terraform

This source code is used to deploy the service-name function app for Fairway IT using the AzureRM Provider for Terraform for more information please visit: <https://www.terraform.io/docs/providers/azurerm/r/app_service.html>

This will create an Azure Function App(Consumption Model) and application insights.

This was written to be used within an Azure DevOps Pipeline and the secrets for creating the services are stored in Azure Key Vault.

All of the settings for configuring the service are contained within the following YAML files.

## Config.yaml Options

If there is a star next to the field name it is not mandatory.

| NAME                        | DESCRIPTION                                                  |          EXAMPLE          |
| --------------------------- | ------------------------------------------------------------ | :-----------------------: |
| subscipt                    | Subscription Abbreviation                                    |          infapp           |
| service                     | Name of the Service                                          |         helpdesk          |
| service-product             | Application  or Product Name                                 |                           |
| costcenter                  | Cost Center to charge back to                                |           1073            |
| data-classification         | Confidential, Proprietary and Public                         |          Private          |
| Owner-email                 | email address for product owner                              |                           |
| pid*                        | Project ID or name if applicable                             |            n/a            |
| Expiration*                 | A date that the environment can be retired.                  |            n/a            |
| location                    | Specifies the supported Azure location where the resource exists. |         centralus    |
| locabbrev                   | Abbreviation used in naming convention                       |            cus            |

## Workspaces dev.yaml Options

If there is a star next to the field name it is not mandatory.

| NAME                        | DESCRIPTION                                                  |          EXAMPLE          |
| --------------------------- | ------------------------------------------------------------ | :-----------------------: |
| environment                 | Deployment Environment Target                                |            dev            |
| subscription_id             | Azure Subscription ID                                        |                           |
| spn_id                      | Service Principle ID                                         |                           |
| spn_oid                     | Service Principle Object ID                                  |                           |
| pid*                        | Project ID or name if applicable                             |            n/a            |
| Expiration*                 | A date that the environment can be retired.                  |            n/a            |
| Environment                 | Deployment Environment Target                                |                           |

## Workspaces prd.yaml Options

If there is a star next to the field name it is not mandatory.

| NAME                        | DESCRIPTION                                                  |          EXAMPLE          |
| --------------------------- | ------------------------------------------------------------ | :-----------------------: |
| environment                 | Deployment Environment Target                                |            dev            |
| subscription_id             | Azure Subscription ID                                        |                           |
| spn_id                      | Service Principle ID                                         |                           |
| spn_oid                     | Service Principle Object ID                                  |                           |
| pid*                        | Project ID or name if applicable                             |            n/a            |
| Expiration*                 | A date that the environment can be retired.                  |            n/a            |
| Environment                 | Deployment Environment Target                                |                           |

## Outputs

| NAME                    | DESCRIPTION                                                  |
| ----------------------- | ------------------------------------------------------------ |
| FUNCAPP_NAME            | The Function App Name                                              |
| funcapp_serviceplan_name | The Function App serviceplan name                                  |
| FUNCAPPRG_NAME          | The name of the function app resource group                        |

## Execution

1) Fork the repo onto your own system (or just download).

2) Rename the folder to the service name you'd like to setup

3) Modify main.tf on line 22 to indicate your new environment and server name. You are not able to use variables in the the backend config:

    `"vp-test01/terraform.tfstate"`

4) Run terraform init to configure the storage for your state file:

    `terraform init -backend-config="access_key=<value>"`

5) Next run terraform plan, you will be prompted to fill out any missing input variables:

    `terraform plan -var client_secret="SuperSecretStuffGoesHere"`

6) If your plan is correct you can then apply the configuration

    `terraform apply -var client_secret="SuperSecretStuffGoesHere"`
