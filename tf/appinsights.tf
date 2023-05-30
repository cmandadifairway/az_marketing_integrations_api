data "azurerm_resource_group" "appinsights" {
  name = "rg-fim-${local.settings.subscipt}-${local.settings.environment}-appinsights"
}

resource "azurerm_log_analytics_workspace" "law" {
  name                = "law-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}"
  location            = local.settings.location
  resource_group_name = data.azurerm_resource_group.appinsights.name
  sku                 = "PerGB2018"
  retention_in_days   = 90
  tags = merge(
    local.settings.default_tags,
    local.settings.tags,
  )
}

resource "azurerm_application_insights" "appinsights" {
  name                = "ai-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}"
  location            = local.settings.location
  resource_group_name = data.azurerm_resource_group.appinsights.name
  workspace_id        = azurerm_log_analytics_workspace.law.id
  application_type    = "web"
  disable_ip_masking  = true
  tags = merge(
    local.settings.default_tags,
    local.settings.tags,
  )
}
