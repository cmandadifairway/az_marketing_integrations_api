terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "<= 2.51.0"
    }
  }
  required_version = ">= 0.13"
}
