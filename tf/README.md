​            |

# service-name Terraform

This source code is used to deploy the service-name function app for Fairway IT using the AzureRM Provider for Terraform for more information please visit: <https://www.terraform.io/docs/providers/azurerm/r/app_service.html>

This will create an Azure Function App(Consumption Model), Applications Insights, Storage Account, & Key Vault.

This was written to be used within an Azure DevOps Pipeline and the secrets for creating the services are stored in Azure Key Vault.

### Inputs

| Name                                     | Description                                            | Type  | Default | Required |
| ---------------------------------------- | ------------------------------------------------------ | ----- | ------- | :------: |
| [client\_secret](#input\_client\_secret) | What is the password for the service principal account | `any` | n/a     |   yes    |

All of the settings for configuring the service are contained within the following YAML files.

## Config.yaml Options

If there is a star next to the field name it is not mandatory.

| NAME                | DESCRIPTION                                 | EXAMPLE  |
| ------------------- | ------------------------------------------- | :------: |
| subscipt            | Subscription Abbreviation                   |  infapp  |
| service             | Name of the Service                         | helpdesk |
| service-product     | Application  or Product Name                |          |
| costcenter          | Cost Center to charge back to               |   1073   |
| data-classification | Confidential, Proprietary and Public        | Private  |
| Owner-email         | email address for product owner             |          |
| pid*                | Project ID or name if applicable            |   n/a    |
| Expiration*         | A date that the environment can be retired. |   n/a    |

## Workspaces dev.yaml Options

If there is a star next to the field name it is not mandatory.

| NAME            | DESCRIPTION                                                  |                EXAMPLE                |
| --------------- | ------------------------------------------------------------ | :-----------------------------------: |
| environment     | Deployment Environment Target                                |                  dev                  |
| subscription_id | Azure Subscription ID                                        |                                       |
| spn_id          | The Service Principal ID of the account running the terraform tasks |                                       |
| spn_oid         | The Service Principal Object ID of the account running the terraform tasks |                                       |
| opsadmin_oid    | The object id of the AZURE-ITINFAPPS-DEV-ADMINS group, used to grant key vault rights |                                       |
| opsengineer_oid | The object id of the AZURE-ITINFAPPS-DEV-ENGINEER group, used to grant key vault rights |                                       |
| pid*            | Project ID or name if applicable                             |                  n/a                  |
| Expiration*     | A date that the environment can be retired.                  |                  n/a                  |
| Environment     | Deployment Environment Target                                |                                       |
| location        | Specifies the supported Azure location where the resource exists. |               centralus               |
| locabbrev       | Abbreviation used in naming convention                       |                  cus                  |
| ip_restrictions | IP Addresses to allow access to the function                 | A list of CIDR formatted IP addresses |

## Workspaces prd.yaml Options

If there is a star next to the field name it is not mandatory.

| NAME            | DESCRIPTION                                                  |                EXAMPLE                |
| --------------- | ------------------------------------------------------------ | :-----------------------------------: |
| environment     | Deployment Environment Target                                |                  dev                  |
| subscription_id | Azure Subscription ID                                        |                                       |
| spn_id          | Service Principle ID                                         |                                       |
| spn_oid         | Service Principle Object ID                                  |                                       |
| opsadmin_oid    | The object id of the AZURE-ITINFAPPS-PROD-ADMINS group, used to grant key vault rights |                                       |
| opsengineer_oid | The object id of the AZURE-ITINFAPPS-PROD-ENGINEER group, used to grant key vault rights |                                       |
| pid*            | Project ID or name if applicable                             |                  n/a                  |
| Expiration*     | A date that the environment can be retired.                  |                  n/a                  |
| Environment     | Deployment Environment Target                                |                                       |
| location        | Specifies the supported Azure location where the resource exists. |               centralus               |
| locabbrev       | Abbreviation used in naming convention                       |                  cus                  |
| ip_restrictions | IP Addresses to allow access to the function                 | A list of CIDR formatted IP addresses |

## Outputs

| NAME                     | DESCRIPTION                                 |
| ------------------------ | ------------------------------------------- |
| FUNCAPP_NAME             | The Function App Name                       |
| funcapp_serviceplan_name | The Function App serviceplan name           |
| FUNCAPPRG_NAME           | The name of the function app resource group |

## Execution

1. Clone the repo onto your own system (or just download).

2.  Find and replace all instances of service-name with your own values. This is used to name the resources. 

3. Update the config & workspace specific yaml files to your specifications

4. Run terraform init to configure the storage for your state file:

   ```hcl
   terraform init -backend-config="access_key=<value>"
   ```

5. Next create or select your workspace

   ```
   terraform workspace select dev || terraform workspace new dev
   ```

6. Next run terraform plan, you will be prompted to fill out any missing input variables:

   ```
   terraform plan -var client_secret="<value>"
   ```

7. If your plan is correct you can then apply the configuration

   ```
   terraform apply -var client_secret="<value>"
   ```

   


<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| terraform | >= 0.13 |
| azurerm | <= 3.18.0 |

## Providers

| Name | Version |
|------|---------|
| azurerm | <= 3.18.0 |

## Resources

| Name | Type |
|------|------|
| [azurerm_application_insights.appinsights](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/application_insights) | resource |
| [azurerm_key_vault.keyVault](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/key_vault) | resource |
| [azurerm_key_vault_access_policy.azureadmins](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/key_vault_access_policy) | resource |
| [azurerm_key_vault_access_policy.azureengineers](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/key_vault_access_policy) | resource |
| [azurerm_key_vault_access_policy.spnkeyvaultpolicy](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/key_vault_access_policy) | resource |
| [azurerm_key_vault_access_policy.webKeyVaultPolicy](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/key_vault_access_policy) | resource |
| [azurerm_log_analytics_workspace.law](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/log_analytics_workspace) | resource |
| [azurerm_monitor_diagnostic_setting.keyvault_monitoring](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/monitor_diagnostic_setting) | resource |
| [azurerm_resource_group.service-name](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/resource_group) | resource |
| [azurerm_role_assignment.developers_contributor](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/role_assignment) | resource |
| [azurerm_service_plan.service-name](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/service_plan) | resource |
| [azurerm_storage_account.service-name](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/storage_account) | resource |
| [azurerm_windows_function_app.service-name](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/windows_function_app) | resource |
| [azurerm_log_analytics_workspace.main](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/log_analytics_workspace) | data source |
| [azurerm_monitor_diagnostic_categories.keyvault_monitoring](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/monitor_diagnostic_categories) | data source |
| [azurerm_resource_group.appinsights](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/resource_group) | data source |
| [azurerm_resource_group.kvrg](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/data-sources/resource_group) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| client\_secret | What is the password for the service principal account | `any` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| FUNCAPPRG\_NAME | The name of the webapp resource group. |
| FUNCAPP\_NAME | The name of the created web app. |
| funcapp\_serviceplan\_name | The name of the created web app service plan. |
| keyvault\_id | n/a |
| keyvault\_name | n/a |
| keyvault\_uri | n/a |
<!-- END_TF_DOCS -->