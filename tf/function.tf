resource "azurerm_resource_group" "service-name" {
  name     = "rg-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}"
  location = local.settings.location
  tags = merge(

    local.settings.default_tags,
    local.settings.tags,
  )
}
resource "azurerm_app_service_plan" "service-name" {
  name                = "fn-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}-plan"
  location            = local.settings.location
  resource_group_name = azurerm_resource_group.service-name.name
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
resource "azurerm_function_app" "service-name" {
  name                       = "fn-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}"
  location                   = local.settings.location
  resource_group_name        = azurerm_resource_group.service-name.name
  app_service_plan_id        = azurerm_app_service_plan.service-name.id
  storage_account_name       = azurerm_storage_account.service-name.name
  storage_account_access_key = azurerm_storage_account.service-name.primary_access_key
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
    "APPINSIGHTS_INSTRUMENTATIONKEY"        = azurerm_application_insights.service-name.instrumentation_key
    "FUNCTIONS_EXTENSION_VERSION"           = "~3"
    "KEY_VAULT_URL"                         = "https://kv-${local.settings.subscipt}-${local.settings.environment}-${local.settings.service}.vault.azure.net/"
    "FUNCTIONS_V2_COMPATIBILITY_MODE"       = "true"
    "WEBSITE_NODE_DEFAULT_VERSION"          = "12.13.0"
    "SCM_ZIPDEPLOY_DONOT_PRESERVE_FILETIME" = "1"
    "WEBSITE_RUN_FROM_PACKAGE"              = "1"
    "LOG_LEVEL"                             = local.settings.loglevel
    "environment"                           = local.settings.environment
  }
  site_config {
    scm_type   = "VSTSRM"
    ftps_state = "Disabled"
    # dynamic "ip_restriction" {
    #   for_each = local.settings.ip_restrictions
    #   content {
    #     ip_address = ip_restriction.value
    #   }
    # }
  }
  lifecycle {
    ignore_changes = [app_settings["WEBSITE_RUN_FROM_PACKAGE"]]
  }
}
