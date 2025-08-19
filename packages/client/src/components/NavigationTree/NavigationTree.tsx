/**
 * NavigationTree Component
 * Hierarchical tree view for content navigation based on JSON manifest structure
 * 
 * @version 1.0.0
 * @since 2025-01-28
 */

import React, { useState } from 'react';
import './NavigationTree.css';

// Icon components
const ChevronRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDown = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export interface TreeNode {
  id: string;
  confluence_num?: string;
  title: string;
  screen_location?: string;
  actionCount?: number;
  lastModified?: string;
  children?: TreeNode[];
  isExpanded?: boolean;
}

interface NavigationTreeProps {
  data: TreeNode[];
  onNodeClick: (node: TreeNode) => void;
  onNodeAction?: (node: TreeNode) => void;
  expandedNodes?: Set<string>;
  onToggleExpand?: (nodeId: string) => void;
}

const NavigationTree: React.FC<NavigationTreeProps> = ({
  data,
  onNodeClick,
  onNodeAction,
  expandedNodes = new Set(),
  onToggleExpand
}) => {
  const [localExpandedNodes, setLocalExpandedNodes] = useState<Set<string>>(expandedNodes);

  const handleToggleExpand = (nodeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (onToggleExpand) {
      onToggleExpand(nodeId);
    } else {
      const newExpanded = new Set(localExpandedNodes);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      setLocalExpandedNodes(newExpanded);
    }
  };

  const isExpanded = (nodeId: string) => {
    return onToggleExpand ? expandedNodes.has(nodeId) : localExpandedNodes.has(nodeId);
  };

  const formatLastModified = (dateString: string | undefined): string => {
    if (!dateString) return 'Не изменено';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Не изменено';
      
      const formatter = new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Asia/Jerusalem',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const parts = formatter.formatToParts(date);
      const day = parts.find(p => p.type === 'day')?.value || '00';
      const month = parts.find(p => p.type === 'month')?.value || '00';
      const year = parts.find(p => p.type === 'year')?.value || '0000';
      const hours = parts.find(p => p.type === 'hour')?.value || '00';
      const minutes = parts.find(p => p.type === 'minute')?.value || '00';
      
      return `${day}.${month}.${year} | ${hours}:${minutes}`;
    } catch {
      return 'Не изменено';
    }
  };

  const renderNode = (node: TreeNode, level: number = 0): JSX.Element => {
    const hasChildren = node.children && node.children.length > 0;
    const expanded = isExpanded(node.id);
    const nodeTitle = node.confluence_num 
      ? `${node.confluence_num}. ${node.title}`
      : node.title;

    return (
      <div key={node.id} className="tree-node-wrapper">
        <div 
          className={`tree-node level-${level}`}
          onClick={() => !hasChildren && onNodeClick(node)}
          style={{ paddingLeft: `${level * 24 + 16}px` }}
        >
          <div className="tree-node-content">
            {hasChildren && (
              <button
                className="tree-expand-btn"
                onClick={(e) => handleToggleExpand(node.id, e)}
                aria-label={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            
            {!hasChildren && <div className="tree-node-spacer" />}
            
            <span className="tree-node-title" title={nodeTitle}>
              {nodeTitle}
            </span>
            
            {node.actionCount !== undefined && (
              <span className="tree-node-count">{node.actionCount}</span>
            )}
            
            {node.lastModified && (
              <span className="tree-node-date">
                {formatLastModified(node.lastModified)}
              </span>
            )}
            
            {onNodeAction && !hasChildren && (
              <button
                className="tree-node-action"
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeAction(node);
                }}
              >
                Просмотр
              </button>
            )}
          </div>
        </div>
        
        {hasChildren && expanded && (
          <div className="tree-children">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="navigation-tree">
      {data.map(node => renderNode(node, 0))}
    </div>
  );
};

export default NavigationTree;