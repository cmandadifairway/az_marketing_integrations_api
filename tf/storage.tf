resource "azurerm_storage_account" "service-name" {
  name                      = "safiminfapp${local.settings.environment}${local.settings.service}"
  resource_group_name       = azurerm_resource_group.service-name.name
  location                  = local.settings.location
  account_tier              = "Standard"
  account_replication_type  = "LRS"
  account_kind              = "StorageV2"
  enable_https_traffic_only = true
  tags                      = local.settings.default_tags
}
