terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "<= 2.22.0"
    }
  }
  required_version = ">= 0.13"
}
