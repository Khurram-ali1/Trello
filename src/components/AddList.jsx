import React, { useState } from 'react';
import { X, Plus } from 'react-feather';

function AddList(props) {
  const [list, setList] = useState('');
  const [show, setShow] = useState(false);

  const saveList = () => {
    if (!list) {
      return;
    }
    props.getlist(list);
    setList('');
    setShow(false);
  };

  const closeBtn = () => {
    setList('');
    setShow(false);
  };

  return (
    <div className='flex flex-col h-fit flex-shrink-0 mr-3 w-60 rounded-md p-2 bg-[#F1F2F4] text-black'>
      {show && (
        <div>
          <textarea
            value={list}
            onChange={(e) => setList(e.target.value)}
            className='p-1 w-full rounded-md bg-white outline-none'
            placeholder='Enter list Title...'
            cols={30}
            rows={2}
          ></textarea>
          <div className='flex p-1'>
            <button onClick={saveList} className='p-2 rounded bg-[#0c66e4] text-white mr-2'>
              Add list
            </button>
            <button onClick={closeBtn} className='p-1 rounded hover:bg-gray-500'>
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      {!show && (
        <button
          onClick={() => setShow(true)}
          className='flex p-1 w-full justify-center rounded items-center mt-1 hover:bg-gray-300 h-8'
        >
          <Plus size={16} />
          Add a list
        </button>
      )}
    </div>
  );
}

export default AddList;