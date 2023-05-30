resource "azurerm_resource_group" "service-name" {
  name     = "rg-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}"
  location = local.settings.location
  tags = merge(
    local.settings.default_tags,
    local.settings.tags,
  )
}

resource "azurerm_role_assignment" "developers_contributor" {
  count                = local.settings.environment == "dev" || local.settings.environment == "tst" ? 1 : 0
  scope                = azurerm_resource_group.service-name.id
  role_definition_name = "Contributor"
  principal_id         = "f450603d-5a3e-44b6-ad47-5a55ead40431"
}

resource "azurerm_service_plan" "service-name" {
  name                = "fn-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}-plan"
  location            = local.settings.location
  resource_group_name = azurerm_resource_group.service-name.name
  sku_name            = local.settings.asp_sku
  os_type             = "Windows"
  tags = merge(
    local.settings.default_tags,
    local.settings.tags,
  )
}

resource "azurerm_windows_function_app" "service-name" {
  name                        = "fn-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}"
  location                    = local.settings.location
  resource_group_name         = azurerm_resource_group.service-name.name
  service_plan_id             = azurerm_service_plan.service-name.id
  storage_account_name        = azurerm_storage_account.service-name.name
  storage_account_access_key  = azurerm_storage_account.service-name.primary_access_key
  https_only                  = "true"
  builtin_logging_enabled     = "false"
  functions_extension_version = "~4"
  tags = merge(
    local.settings.default_tags,
    local.settings.tags,
  )
  identity {
    type = "SystemAssigned"
  }
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME"                  = "node"
    "KEY_VAULT_URL"                             = "https://kv-${local.settings.subscipt}-${local.settings.environment}-service-name.vault.azure.net/"
    "WEBSITE_RUN_FROM_PACKAGE"                  = "1"
    "LOG_LEVEL"                                 = local.settings.loglevel
    "environment"                               = local.settings.environment
    "location"                                  = local.settings.location
    "DATALAKE_ACCOUNT_NAME"                     = local.settings.datalake_account_name
    "DATALAKE_MKTG_INTEGRATIONS_FOLDER_PATH"    = local.settings.datalake_mktg_integrations_folder_path
    "DATALAKE_FLOWAPI_FOLDER"                   = local.settings.datalake_flowapi_folder
    "DATALAKE_MAILCHIMP_FOLDER"                 = local.settings.datalake_mailchimp_folder
    "DATALAKE_TOTALEXPERT_FOLDER"               = local.settings.datalake_totalexpert_folder
    "DATALAKE_WORKFRONT_FOLDER"                 = local.settings.datalake_workfront_folder
    "MAILCHIMP_API_BASE_URL"                    = local.settings.mailchimp_api_base_url
    "MAILCHIMP_LIST_ID"                         = local.settings.mailchimp_list_id
    "MAILCHIMP_OPERATION_ID"                    = local.settings.mailchimp_operation_id
    "MAILCHIMP_EMAIL_ERROR_TO"                  = local.settings.mailchimp_email_error_to
    "MAILCHIMP_EMAIL_ERROR_SUBJECT"             = local.settings.mailchimp_email_error_subject
    "MAILCHIMP_EMAIL_REPORT_TO"                 = local.settings.mailchimp_email_report_to
    "MAILCHIMP_EMAIL_REPORT_FROM"               = local.settings.mailchimp_email_report_from
    "MAILCHIMP_EMAIL_REPORT_SUBJECT"            = local.settings.mailchimp_email_report_subject
    "INACTIVE_USERS_DAYS_AGO"                   = local.settings.inactive_users_days_ago
    "WORKFRONT_EMAIL_ERROR_TO"                  = local.settings.workfront_email_error_to
    "WORKFRONT_EMAIL_ERROR_SUBJECT"             = local.settings.workfront_email_error_subject
    "WORKFRONT_EMAIL_REPORT_TO"                 = local.settings.workfront_email_report_to
    "WORKFRONT_EMAIL_REPORT_FROM"               = local.settings.workfront_email_report_from
    "WORKFRONT_EMAIL_REPORT_SUBJECT"            = local.settings.workfront_email_report_subject
    "TOTALEXPERT_EMAIL_ERROR_TO"                = local.settings.totalexpert_email_error_to
    "TOTALEXPERT_EMAIL_ERROR_SUBJECT"           = local.settings.totalexpert_email_error_subject
    "TOTALEXPERT_EMAIL_REPORT_TO"               = local.settings.totalexpert_email_report_to
    "TOTALEXPERT_EMAIL_REPORT_FROM"             = local.settings.totalexpert_email_report_from
    "TOTALEXPERT_EMAIL_REPORT_SUBJECT"          = local.settings.totalexpert_email_report_subject
    "WEBDATA_URL"                               = local.settings.webdata_url
  }
  site_config {
    application_insights_connection_string = azurerm_application_insights.appinsights.connection_string
    application_insights_key               = azurerm_application_insights.appinsights.instrumentation_key
    ftps_state                             = "Disabled"
    http2_enabled                          = true
    minimum_tls_version                    = "1.2"
    use_32_bit_worker                      = false
    dynamic "ip_restriction" {
      for_each = local.settings.ip_restrictions
      content {
        ip_address = ip_restriction.value
      }
    }
    dynamic "application_stack" {
      for_each = local.settings.app_stack
      content {
        dotnet_version              = lookup(application_stack.value, "dotnet_version", null)
        java_version                = lookup(application_stack.value, "java_version", null)
        node_version                = lookup(application_stack.value, "node_version", null)
        powershell_core_version     = lookup(application_stack.value, "powershell_core_version", null)
        use_custom_runtime          = lookup(application_stack.value, "use_custom_runtime", null)
        use_dotnet_isolated_runtime = lookup(application_stack.value, "use_dotnet_isolated_runtime", null)
      }
    }
  }
  lifecycle {
    ignore_changes = [app_settings["WEBSITE_RUN_FROM_PACKAGE"]]
  }
}
