data "azurerm_log_analytics_workspace" "main" {
  name                = local.settings.log_analytics
  resource_group_name = local.settings.log_analytics_rg
}

data "azurerm_monitor_diagnostic_categories" "function_monitoring" {
  resource_id = azurerm_windows_function_app.service-name.id
}

resource "azurerm_monitor_diagnostic_setting" "function_monitoring" {
  name                       = "LogAnalytics-Diagnostics"
  target_resource_id         = azurerm_windows_function_app.service-name.id
  log_analytics_workspace_id = data.azurerm_log_analytics_workspace.main.id
  dynamic "enabled_log" {
    iterator = log_category
    for_each = data.azurerm_monitor_diagnostic_categories.function_monitoring.log_category_types
    content {
      category = log_category.value
      retention_policy {
        days    = 90
        enabled = true
      }
    }
  }
  dynamic "metric" {
    iterator = metric_category
    for_each = data.azurerm_monitor_diagnostic_categories.function_monitoring.metrics
    content {
      category = metric_category.value
      retention_policy {
        days    = 90
        enabled = true
      }
    }
  }
}