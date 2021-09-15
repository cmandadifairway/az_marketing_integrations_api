resource "azurerm_resource_group" "ff-admin-api" {
  name     = "rg-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}"
  location = local.settings.location
  tags = merge(

    local.settings.default_tags,
    local.settings.tags,
  )
}

resource "azurerm_role_assignment" "developers_contributor" {
  count                = local.settings.rbac_enabled
  scope                = azurerm_resource_group.ff-admin-api.id
  role_definition_name = "Contributor"
  principal_id         = "f450603d-5a3e-44b6-ad47-5a55ead40431"
}

resource "azurerm_app_service_plan" "ff-admin-api" {
  name                = "fn-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}-plan"
  location            = local.settings.location
  resource_group_name = azurerm_resource_group.ff-admin-api.name
  kind                = "FunctionApp"
  sku {
    tier = "Dynamic"
    size = "Y1"
  }
  tags = merge(

    local.settings.default_tags,
    local.settings.tags,
  )
}
resource "azurerm_function_app" "ff-admin-api" {
  name                       = "fn-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}"
  location                   = local.settings.location
  resource_group_name        = azurerm_resource_group.ff-admin-api.name
  app_service_plan_id        = azurerm_app_service_plan.ff-admin-api.id
  storage_account_name       = azurerm_storage_account.ff-admin-api.name
  storage_account_access_key = azurerm_storage_account.ff-admin-api.primary_access_key
  https_only                 = "true"
  version                    = "~3"
  tags = merge(

    local.settings.default_tags,
    local.settings.tags,
  )
  identity {
    type = "SystemAssigned"
  }
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME"              = "node"
    "APPINSIGHTS_INSTRUMENTATIONKEY"        = azurerm_application_insights.ff-admin-api.instrumentation_key
    "FUNCTIONS_EXTENSION_VERSION"           = "~3"
    "KEY_VAULT_URL"                         = "https://kv-${local.settings.subscipt}-${local.settings.environment}-${local.settings.service}.vault.azure.net/"
    "WEBSITE_NODE_DEFAULT_VERSION"          = "14.15.1"
    "SCM_ZIPDEPLOY_DONOT_PRESERVE_FILETIME" = "1"
    "WEBSITE_RUN_FROM_PACKAGE"              = "1"
    "LOG_LEVEL"                             = local.settings.loglevel
    "environment"                           = local.settings.environment
    "global-config-endpoint"                = local.settings.global-config-endpoint
    "global-config-endpoint-secondary"      = local.settings.global-config-endpoint-secondary
  }
  site_config {
    scm_type   = "VSTSRM"
    ftps_state = "Disabled"
    dynamic "ip_restriction" {
      for_each = local.settings.ip_restrictions
      content {
        ip_address = ip_restriction.value
      }
    }
  }
  lifecycle {
    ignore_changes = [app_settings["WEBSITE_RUN_FROM_PACKAGE"]]
  }
}
