/**
 * Search Module
 *
 * Provides full-text search capabilities using App Search.
 * Supports product, category, and brand search with faceting.
 */

import { Module } from '@medusajs/framework/utils';
import SearchModuleService from './service';

export const SEARCH_MODULE = 'searchModuleService';

export default Module(SEARCH_MODULE, {
  service: SearchModuleService,
});

export * from './service';
export * from './providers';
export * from './utils';
