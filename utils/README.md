# /utils

This directory contains pure, reusable utility functions that can be used across the application.

## Purpose

The purpose of this folder is to house generic helper functions that are not tied to a specific component, service, or piece of business logic. These functions should be small, focused, and free of side effects.

**Code in this directory should:**
*   Be pure (given the same input, it always returns the same output).
*   Have no dependencies on React, component state, or external services.
*   Be generic and potentially usable in multiple parts of the application.

## Utility Inventory

*   `selection.ts`: Contains logic for calculating the next item to select in a list after an action like deleting or moving items.

## Where to Add New Files

If you create a new, reusable helper function (e.g., for formatting dates, parsing text, etc.), it should be placed in a relevantly named file within this directory.
