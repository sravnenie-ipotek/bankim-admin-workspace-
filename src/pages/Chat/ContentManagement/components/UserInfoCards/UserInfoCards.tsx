/**
 * UserInfoCards Component
 * Display user information cards with action count and last modified date
 * 
 * @version 1.0.0
 * @author BankIM Development Team
 * @since 2024-12-17
 */

import React from 'react';
import './UserInfoCards.css';

interface UserInfoCardsProps {
  actionCount: number;
  lastModified: string;
  className?: string;
}

const UserInfoCards: React.FC<UserInfoCardsProps> = ({
  actionCount,
  lastModified,
  className = ''
}) => {
  return (
    <div className={`user-info-cards ${className}`}>
      <div className="info-card">
        <div className="card-content">
          <div className="card-label">Количество действий</div>
          <div className="card-value">{actionCount}</div>
        </div>
      </div>
      
      <div className="info-card">
        <div className="card-content">
          <div className="card-label">Последнее редактирование</div>
          <div className="card-value">{lastModified}</div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCards;