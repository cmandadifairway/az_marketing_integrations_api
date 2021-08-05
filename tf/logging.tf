data "azurerm_log_analytics_workspace" "main" {
  name                = local.settings.log_analytics
  resource_group_name = local.settings.log_analytics_rg
}

resource "azurerm_monitor_diagnostic_setting" "keyvault_monitoring" {
  name                       = "LogAnalytics-Diagnostics"
  target_resource_id         = azurerm_key_vault.keyVault.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.main.id

  log {
    category = "AuditEvent"
    enabled  = true

    retention_policy {
      enabled = true
      days    = 90
    }
  }

  metric {
    category = "AllMetrics"

    retention_policy {
      enabled = true
      days    = 90
    }
  }
}