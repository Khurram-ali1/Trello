import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'react-feather';

function CardAdd({ listId, getcard }) {
  const [cardTitle, setCardTitle] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const textareaRef = useRef(null);

  // Auto-focus textarea when form opens
  useEffect(() => {
    if (isFormVisible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isFormVisible]);

  const handleAddCard = async () => {  // Changed to async
    if (!cardTitle.trim() || isAdding) return;
    
    console.log("Adding card to list ID:", listId);
    setIsAdding(true);
    
    try {
      await getcard(cardTitle.trim());  // Wait for the card creation
      setCardTitle('');
      setIsFormVisible(false);
    } catch (error) {
      console.error("Failed to add card:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddCard();
    }
  };

  const handleClose = () => {
    setCardTitle('');
    setIsFormVisible(false);
  };

  return (
    <div className='flex flex-col'>
      {isFormVisible ? (
        <div className='space-y-2'>
          <textarea
            ref={textareaRef}
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className='p-2 w-full rounded-md outline-none bg-white shadow-sm border border-gray-300 focus:border-blue-500 resize-none'
            placeholder='Enter card title...'
            rows={3}
            disabled={isAdding}  // Disable during loading
          />
          <div className='flex items-center space-x-2'>
            <button
              onClick={handleAddCard}
              disabled={isAdding}
              className={`px-3 py-1.5 rounded text-white transition-colors ${
                isAdding ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isAdding ? (
                <>
                  <span className="inline-block animate-spin mr-2">↻</span>
                  Adding...
                </>
              ) : 'Add card'}
            </button>
            <button
              onClick={handleClose}
              disabled={isAdding}
              className='p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-600'
              aria-label='Close'
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsFormVisible(true)}
          className='flex items-center w-full p-2 rounded hover:bg-gray-200 transition-colors text-gray-700'
          disabled={isAdding}
        >
          <Plus size={16} className='mr-1' />
          <span>{isAdding ? 'Adding card...' : 'Add a card'}</span>
        </button>
      )}
    </div>
  );
}

export default React.memo(CardAdd);