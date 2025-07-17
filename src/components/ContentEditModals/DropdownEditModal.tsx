import React, { useState } from 'react';
import './ContentEditModals.css';

export interface DropdownOption {
  id: string;
  order: number;
  text: {
    ru: string;
    he: string;
  };
}

export interface DropdownEditData {
  title: {
    ru: string;
    he: string;
  };
  options: DropdownOption[];
}

interface DropdownEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DropdownEditData) => void;
  actionName: string;
}

export const DropdownEditModal: React.FC<DropdownEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  actionName,
}) => {
  const [title, setTitle] = useState({ ru: 'Основной источник дохода', he: 'מקור הכנסה עיקרי' });
  const [options, setOptions] = useState<DropdownOption[]>([
    { id: '1', order: 1, text: { ru: 'Сотрудник', he: 'עובד' } },
    { id: '2', order: 2, text: { ru: 'Индивидуальный предприниматель', he: 'עצמאי' } },
    { id: '3', order: 3, text: { ru: 'Компания', he: 'חברה' } },
  ]);

  const handleSave = () => {
    onSave({ title, options });
    onClose();
  };

  const handleAddOption = () => {
    const newId = (options.length + 1).toString();
    const newOrder = options.length + 1;
    setOptions([...options, { id: newId, order: newOrder, text: { ru: '', he: '' } }]);
  };

  const handleDeleteOption = (id: string) => {
    setOptions(options.filter(option => option.id !== id));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content dropdown-edit-modal">
        <div className="modal-header">
          <h3>Редактировать действие Dropdown: {actionName}</h3>
          <button onClick={onClose} className="modal-close-button">&times;</button>
        </div>
        <div className="modal-body">
          <div className="dropdown-form">
            <h4>Заголовки действий</h4>
            <div className="input-group">
              <label>RU</label>
              <input type="text" value={title.ru} onChange={(e) => setTitle({ ...title, ru: e.target.value })} />
            </div>
            <div className="input-group">
              <label>HEB</label>
              <input type="text" value={title.he} onChange={(e) => setTitle({ ...title, he: e.target.value })} dir="rtl" />
            </div>

            <h4>Опции ответов</h4>
            <div className="dropdown-options-list">
              {options.map((option, index) => (
                <div key={option.id} className="dropdown-option-row">
                  <div className="option-controls">
                    <span>{option.order}</span>
                    <img src="/assets/images/static/mobile/bars.svg" alt="drag handle" className="drag-handle" />
                  </div>
                  <div className="option-inputs">
                    <input
                      type="text"
                      placeholder="RU"
                      value={option.text.ru}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index].text.ru = e.target.value;
                        setOptions(newOptions);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="HEB"
                      value={option.text.he}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index].text.he = e.target.value;
                        setOptions(newOptions);
                      }}
                      dir="rtl"
                    />
                  </div>
                  <div className="option-actions">
                    <button className="icon-button">
                      <img src="/assets/images/static/calculate-credit/pencilsimple1132-cw1.svg" alt="edit" />
                    </button>
                    <button className="icon-button" onClick={() => handleDeleteOption(option.id)}>
                      <img src="/assets/images/static/mobile/trash.svg" alt="delete" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="add-option-button" onClick={handleAddOption}>
              <img src="/assets/images/static/mobile/plus.svg" alt="add" />
              Добавить вариант
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="button-secondary" onClick={onClose}>Назад</button>
          <button className="button-primary" onClick={handleSave}>Сохранить и опубликовать</button>
        </div>
      </div>
    </div>
  );
};

export default DropdownEditModal; 