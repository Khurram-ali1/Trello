import React, { useState, useContext } from 'react';
import { X, Plus } from 'react-feather';
import { BoardContext } from '../context/BoardContext';

function AddList({ getlist }) {
  const [listTitle, setListTitle] = useState('');
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { allboard, createList } = useContext(BoardContext);
  const [isSubmitting, setIsSubmitting] = useState(false); // New prevention state

  const saveList = async () => {
    if (!listTitle.trim() || !allboard.active || isSubmitting) return;
    
    setIsSubmitting(true);
    setIsLoading(true);
    
    try {
      const result = await createList(allboard.active, listTitle);
      
      if (result.success) {
        if (getlist) getlist(result.data.title);
        setListTitle('');
        setShow(false);
      }
    } catch (error) {
      console.error("Error creating list:", error);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const closeBtn = () => {
    if (isSubmitting) return;
    setListTitle('');
    setShow(false);
  };

  return (
    <div className='flex flex-col h-fit flex-shrink-0 mr-3 w-60 rounded-md p-2 bg-[#F1F2F4] text-black'>
      {show && (
        <div>
          <textarea
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            className='p-1 w-full rounded-md bg-white outline-none'
            placeholder='Enter list Title...'
            cols={30}
            rows={2}
            autoFocus
            disabled={isSubmitting}
          />
          <div className='flex p-1'>
            <button 
              onClick={saveList} 
              className='p-2 rounded bg-[#0c66e4] text-white mr-2 disabled:opacity-50'
              disabled={isLoading || isSubmitting}
            >
              {isLoading ? 'Adding...' : 'Add list'}
            </button>
            <button 
              onClick={closeBtn} 
              className='p-1 rounded hover:bg-gray-500 disabled:opacity-50'
              disabled={isSubmitting}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      {!show && (
        <button
          onClick={() => !isSubmitting && setShow(true)}
          className='flex p-1 w-full justify-center rounded items-center mt-1 hover:bg-gray-300 h-8 disabled:opacity-50'
          disabled={!allboard.active || isSubmitting}
        >
          <Plus size={16} />
          Add a list
        </button>
      )}
    </div>
  );
}

export default AddList;