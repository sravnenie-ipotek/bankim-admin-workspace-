import React, { useState, useEffect } from 'react';
import './ContentEditModals.css';

export interface TextEditData {
  text: {
    ru: string;
    he: string;
    en: string;
  };
  style: {
    font: string;
    size: number;
    color: string;
    weight: string;
  };
  position: {
    x: number;
    y: number;
  };
}

interface TextEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TextEditData) => void;
  actionName: string;
}

export const TextEditModal: React.FC<TextEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  actionName,
}) => {
  const [activeLang, setActiveLang] = useState<'ru' | 'he' | 'en'>('ru');
  const [text, setText] = useState({ ru: '', he: '', en: '' });
  const [style, setStyle] = useState({ font: 'Arimo', size: 16, color: '#FFFFFF', weight: '400' });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleSave = () => {
    onSave({ text, style, position });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content text-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-left-panel">
          <div className="modal-header">
            <h3>Редактирование текста: "{actionName}"</h3>
            <button onClick={onClose} className="close-button">&times;</button>
          </div>
          <div className="language-tabs">
            <button onClick={() => setActiveLang('ru')} className={activeLang === 'ru' ? 'active' : ''}>RU</button>
            <button onClick={() => setActiveLang('he')} className={activeLang === 'he' ? 'active' : ''}>HE</button>
            <button onClick={() => setActiveLang('en')} className={activeLang === 'en' ? 'active' : ''}>EN</button>
          </div>
          <div className="modal-body">
            <textarea
              value={text[activeLang]}
              onChange={(e) => setText({ ...text, [activeLang]: e.target.value })}
              className="text-input-area"
              style={{ direction: activeLang === 'he' ? 'rtl' : 'ltr' }}
            />
            <div className="controls-grid">
              <div className="control-group">
                <label>Шрифт</label>
                <select value={style.font} onChange={e => setStyle({...style, font: e.target.value})}>
                  <option value="Arimo">Arimo</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                </select>
              </div>
               <div className="control-group">
                <label>Размер</label>
                <input type="number" value={style.size} onChange={e => setStyle({...style, size: parseInt(e.target.value)})} />
              </div>
              <div className="control-group">
                <label>Цвет</label>
                <input type="color" value={style.color} onChange={e => setStyle({...style, color: e.target.value})} />
              </div>
              <div className="control-group">
                <label>Насыщенность</label>
                 <select value={style.weight} onChange={e => setStyle({...style, weight: e.target.value})}>
                  <option value="400">Normal</option>
                  <option value="500">Medium</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                </select>
              </div>
              <div className="control-group">
                <label>Позиция X</label>
                <input type="number" value={position.x} onChange={e => setPosition({...position, x: parseInt(e.target.value)})} />
              </div>
              <div className="control-group">
                <label>Позиция Y</label>
                <input type="number" value={position.y} onChange={e => setPosition({...position, y: parseInt(e.target.value)})} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="button-secondary">Назад</button>
            <button onClick={handleSave} className="button-primary">Сохранить и опубликовать</button>
          </div>
        </div>
        <div className="modal-right-panel">
          <h4>Предпросмотр</h4>
          <div className="preview-area">
            <p style={{
              fontFamily: style.font,
              fontSize: `${style.size}px`,
              color: style.color,
              fontWeight: style.weight,
              direction: activeLang === 'he' ? 'rtl' : 'ltr'
            }}>
              {text[activeLang]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 