/**
 * Content Type Utilities
 * Centralized logic for handling different content types (mortgage, mortgage-refi, credit, etc.)
 */

export type ContentType = 'mortgage' | 'mortgage-refi' | 'credit' | 'credit-refi';

export interface ContentTypeConfig {
  type: ContentType;
  apiPath: string;
  basePath: string;
  displayName: string;
}

const CONTENT_TYPE_CONFIGS: Record<ContentType, ContentTypeConfig> = {
  'mortgage': {
    type: 'mortgage',
    apiPath: 'mortgage',
    basePath: '/content/mortgage',
    displayName: 'Ипотека'
  },
  'mortgage-refi': {
    type: 'mortgage-refi',
    apiPath: 'mortgage-refi',
    basePath: '/content/mortgage-refi',
    displayName: 'Рефинансирование ипотеки'
  },
  'credit': {
    type: 'credit',
    apiPath: 'credit',
    basePath: '/content/credit',
    displayName: 'Кредит'
  },
  'credit-refi': {
    type: 'credit-refi',
    apiPath: 'credit-refi',
    basePath: '/content/credit-refi',
    displayName: 'Рефинансирование кредита'
  }
};

/**
 * Detect content type from URL pathname
 */
export function detectContentTypeFromPath(pathname: string): ContentType {
  for (const [type, config] of Object.entries(CONTENT_TYPE_CONFIGS)) {
    if (pathname.includes(config.basePath)) {
      return type as ContentType;
    }
  }
  return 'mortgage'; // Default fallback
}

/**
 * Get content type configuration
 */
export function getContentTypeConfig(type: ContentType): ContentTypeConfig {
  return CONTENT_TYPE_CONFIGS[type];
}

/**
 * Generate paths for content type
 */
export function generateContentPaths(type: ContentType, actionId?: string, pageId?: string) {
  const config = getContentTypeConfig(type);
  
  return {
    listPath: config.basePath,
    drillPath: pageId ? `${config.basePath}/drill/${pageId}` : `${config.basePath}/drill`,
    textEditPath: actionId ? `${config.basePath}/text-edit/${actionId}` : `${config.basePath}/text-edit`,
    dropdownEditPath: actionId ? `${config.basePath}/dropdown-edit/${actionId}` : `${config.basePath}/dropdown-edit`,
    editPath: actionId ? `${config.basePath}/edit/${actionId}` : `${config.basePath}/edit`,
  };
}

/**
 * Generate API endpoints for content type
 */
export function generateApiEndpoints(type: ContentType, pageId?: string) {
  const config = getContentTypeConfig(type);
  
  return {
    contentEndpoint: `/api/content/${config.apiPath}`,
    drillEndpoint: pageId ? `/api/content/${config.apiPath}/drill/${pageId}` : `/api/content/${config.apiPath}/drill`,
    allItemsEndpoint: `/api/content/${config.apiPath}/all-items`,
  };
}

/**
 * Get content data key for API responses
 */
export function getContentDataKey(type: ContentType): string {
  const config = getContentTypeConfig(type);
  return `${config.apiPath.replace('-', '_')}_content`;
} 