resource "azurerm_resource_group" "service-name" {
  name     = "rg-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}"
  location = local.settings.location
  tags     = local.settings.default_tags
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
}
resource "azurerm_function_app" "service-name" {
  name                      = "fn-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}"
  location                  = local.settings.location
  resource_group_name       = azurerm_resource_group.service-name.name
  app_service_plan_id       = azurerm_app_service_plan.service-name.id
  storage_connection_string = azurerm_storage_account.service-name.primary_connection_string
  https_only                = "true"
  version                   = "~2"
  identity {
    type = "SystemAssigned"
  }
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME"              = "node"
    "APPINSIGHTS_INSTRUMENTATIONKEY"        = "${azurerm_application_insights.service-name.instrumentation_key}",
    "FUNCTIONS_EXTENSION_VERSION"           = "~2"
    "KEY_VAULT_URL"                         = "https://${azurerm_key_vault.keyVault.name}.vault.azure.net/"
    "FUNCTIONS_V2_COMPATIBILITY_MODE"       = "true"
    "WEBSITE_NODE_DEFAULT_VERSION"          = "12.13.0"
    "SCM_ZIPDEPLOY_DONOT_PRESERVE_FILETIME" = "1"
    "WEBSITE_RUN_FROM_PACKAGE"              = "1"
  }
}
