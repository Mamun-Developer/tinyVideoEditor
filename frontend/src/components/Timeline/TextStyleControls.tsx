import React from 'react';
import { TextStyle } from '../../types/api';
import './TextStyleControls.css';

interface TextStyleControlsProps {
  style: TextStyle;
  onStyleChange: (newStyle: TextStyle) => void;
}

export const TextStyleControls: React.FC<TextStyleControlsProps> = ({
  style,
  onStyleChange
}) => {
  const handleChange = (field: keyof TextStyle, value: string | number) => {
    onStyleChange({
      ...style,
      [field]: value
    });
  };

  return (
    <div className="text-style-controls">
      <div className="style-section">
        <h3>Font Settings</h3>
        <div className="control-group">
          <label>
            Font Family
            <select 
              value={style.fontFamily} 
              onChange={(e) => handleChange('fontFamily', e.target.value)}
            >
              <option value="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf">DejaVu Sans Bold</option>
              <option value="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf">DejaVu Sans</option>
              <option value="/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf">Liberation Sans</option>
            </select>
          </label>
        </div>
        
        <div className="control-group">
          <label>
            Font Size
            <input 
              type="number" 
              min="12"
              max="72"
              value={style.fontSize} 
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
            />
          </label>
        </div>
        
        <div className="control-group">
          <label>
            Font Color
            <input 
              type="color" 
              value={style.fontColor}
              onChange={(e) => handleChange('fontColor', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="style-section">
        <h3>Background</h3>
        <div className="control-group">
          <label>
            Background Color
            <input 
              type="color" 
              value={style.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
            />
          </label>
        </div>
        
        <div className="control-group">
          <label>
            Background Opacity
            <input 
              type="range" 
              min="0"
              max="1"
              step="0.1"
              value={style.backgroundOpacity}
              onChange={(e) => handleChange('backgroundOpacity', parseFloat(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div className="style-section">
        <h3>Border & Padding</h3>
        <div className="control-group">
          <label>
            Border Width
            <input 
              type="number" 
              min="0"
              max="10"
              value={style.borderWidth}
              onChange={(e) => handleChange('borderWidth', parseInt(e.target.value))}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Border Color
            <input 
              type="color" 
              value={style.borderColor}
              onChange={(e) => handleChange('borderColor', e.target.value)}
            />
          </label>
        </div>

        <div className="control-group">
          <label>
            Padding
            <input 
              type="number" 
              min="0"
              max="20"
              value={style.padding}
              onChange={(e) => handleChange('padding', parseInt(e.target.value))}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
