resource "azurerm_storage_account" "service-name" {
  name                             = "sainfapp${local.settings.environment}${local.settings.locabbrev}${local.settings.service}"
  resource_group_name              = azurerm_resource_group.service-name.name
  location                         = local.settings.location
  account_tier                     = "Standard"
  account_replication_type         = "LRS"
  account_kind                     = "StorageV2"
  enable_https_traffic_only        = true
  min_tls_version                  = "TLS1_2"
  allow_nested_items_to_be_public  = false
  cross_tenant_replication_enabled = false
  tags = merge(
    local.settings.default_tags,
    local.settings.tags,
  )
}