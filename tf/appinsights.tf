data "azurerm_resource_group" "appinsights" {
  name = "rg-fim-${local.settings.subscipt}-${local.settings.environment}-appinsights"
}

resource "azurerm_application_insights" "ff-admin-api" {
  name                = "ai-fim-${local.settings.subscipt}-${local.settings.environment}-${local.settings.locabbrev}-${local.settings.service}"
  location            = local.settings.location
  resource_group_name = data.azurerm_resource_group.appinsights.name
  application_type    = "web"
  tags = merge(

    local.settings.default_tags,
    local.settings.tags,
  )
}
