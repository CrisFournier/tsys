import { useState, useRef, useEffect } from 'react';

interface SelectWithCreateProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; nome: string }>;
  onCreate: (nome: string) => Promise<{ id: string; nome: string }>;
  placeholder?: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
}

const SelectWithCreate = ({
  value,
  onChange,
  options,
  onCreate,
  placeholder = 'Selecione ou digite para criar...',
  label,
  required = false,
  disabled = false,
}: SelectWithCreateProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowInput(false);
        setInputValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setShowInput(false);
    setInputValue('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleCreate = async () => {
    if (!inputValue.trim()) return;

    setIsCreating(true);
    try {
      const newItem = await onCreate(inputValue.trim());
      onChange(newItem.id);
      setInputValue('');
      setShowInput(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao criar item:', error);
      alert('Erro ao criar item. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleCreate();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setInputValue('');
      setIsOpen(false);
    }
  };

  const filteredOptions = options.filter((opt) =>
    opt.nome.toLowerCase().includes(inputValue.toLowerCase()),
  );

  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && '*'}
      </label>
      <div ref={containerRef} style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            border: '1px solid #ddd',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          {!showInput ? (
            <>
              <select
                className="form-select"
                value={value || ''}
                onChange={(e) => {
                  if (e.target.value === '__create__') {
                    setShowInput(true);
                    setIsOpen(true);
                  } else {
                    handleSelect(e.target.value);
                  }
                }}
                required={required}
                disabled={disabled}
                style={{ flex: 1, border: 'none' }}
              >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.nome}
                  </option>
                ))}
                <option value="__create__" style={{ fontStyle: 'italic' }}>
                  + Criar novo...
                </option>
              </select>
            </>
          ) : (
            <div style={{ display: 'flex', width: '100%', gap: '4px' }}>
              <input
                ref={inputRef}
                type="text"
                className="form-input"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Digite o nome e pressione Enter"
                style={{ flex: 1, border: 'none' }}
                disabled={isCreating}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={!inputValue.trim() || isCreating}
                style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem' }}
              >
                {isCreating ? 'Criando...' : 'Criar'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowInput(false);
                  setInputValue('');
                  setIsOpen(false);
                }}
                style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem' }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {isOpen && showInput && filteredOptions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginTop: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            {filteredOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                style={{
                  padding: '0.5rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                {opt.nome}
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedOption && !showInput && (
        <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
          Selecionado: {selectedOption.nome}
        </small>
      )}
    </div>
  );
};

export default SelectWithCreate;




