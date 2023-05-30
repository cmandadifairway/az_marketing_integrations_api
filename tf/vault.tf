data "azurerm_client_config" "current" {}

data "azurerm_resource_group" "kvrg" {
  name = "rg-fim-${local.settings.subscipt}-${local.settings.environment}-core"
}

resource "azurerm_key_vault" "keyVault" {
  name                       = "kv-${local.settings.subscipt}-${local.settings.environment}-${local.settings.service}"
  location                   = local.settings.location
  resource_group_name        = data.azurerm_resource_group.kvrg.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days = 7
  purge_protection_enabled   = false
  sku_name                   = "standard"
  tags = merge(
    local.settings.default_tags,
    local.settings.tags,
  )
  lifecycle {
    ignore_changes = [
      access_policy,
    ]
  }
}

resource "azurerm_key_vault_access_policy" "webKeyVaultPolicy" {
  key_vault_id = azurerm_key_vault.keyVault.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_windows_function_app.service-name.identity.0.principal_id
  secret_permissions = [
    "Get",
    "List",
  ]
}

resource "azurerm_key_vault_access_policy" "spn" {
  key_vault_id = azurerm_key_vault.keyVault.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id
  secret_permissions = [
    "Backup",
    "Delete",
    "Get",
    "List",
    "Purge",
    "Recover",
    "Restore",
    "Set",
  ]
}

data "azuread_group" "azure_admins" {
  display_name = local.settings.azure_admins
}

resource "azurerm_key_vault_access_policy" "azure_admins" {
  key_vault_id = azurerm_key_vault.keyVault.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azuread_group.azure_admins.object_id
  secret_permissions = [
    "Backup",
    "Delete",
    "Get",
    "List",
    "Purge",
    "Recover",
    "Restore",
    "Set",
  ]
}

data "azuread_group" "azure_engineers" {
  display_name = local.settings.azure_engineers
}

resource "azurerm_key_vault_access_policy" "azure_engineers" {
  key_vault_id = azurerm_key_vault.keyVault.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azuread_group.azure_engineers.object_id
  secret_permissions = [
    "Get",
    "List",
    "Set",
    "Delete"
  ]
}

data "azuread_group" "developers" {
  display_name = "CICD-DEVELOPERS"
}

resource "azurerm_key_vault_access_policy" "developers" {
  count        = local.settings.environment == "dev" || local.settings.environment == "tst" ? 1 : 0
  key_vault_id = azurerm_key_vault.keyVault.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azuread_group.developers.object_id
  secret_permissions = [
    "Get",
    "List"
  ]
}

data "azurerm_monitor_diagnostic_categories" "keyvault_monitoring" {
  resource_id = azurerm_key_vault.keyVault.id
}
resource "azurerm_monitor_diagnostic_setting" "keyvault_monitoring" {
  name                       = "LogAnalytics-Diagnostics"
  target_resource_id         = azurerm_key_vault.keyVault.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.main.id
  dynamic "log" {
    iterator = log_category
    for_each = data.azurerm_monitor_diagnostic_categories.keyvault_monitoring.logs
    content {
      enabled  = contains(local.settings.disabled_logging_categories, log_category.value) ? false : true
      category = log_category.value
      retention_policy {
        days    = 90
        enabled = contains(local.settings.disabled_logging_categories, log_category.value) ? false : true
      }
    }
  }
  dynamic "metric" {
    iterator = metric_category
    for_each = data.azurerm_monitor_diagnostic_categories.keyvault_monitoring.metrics
    content {
      enabled  = contains(local.settings.disabled_logging_categories, metric_category.value) ? false : true
      category = metric_category.value
      retention_policy {
        days    = 90
        enabled = contains(local.settings.disabled_logging_categories, metric_category.value) ? false : true
      }
    }
  }
}