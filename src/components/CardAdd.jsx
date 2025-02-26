import React, { useState } from 'react';
import { X, Plus } from 'react-feather';

function CardAdd(props) {
  const [card, setCard] = useState('');
  const [show, setShow] = useState(false);

  const saveCard = () => {
    if (!card) {
      return;
    }
    props.getcard(card);
    setCard('');
    setShow(false);
  };

  const closeBtn = () => {
    setCard('');
    setShow(false);
  };

  return (
    <div className='flex flex-col'>
      {show && (
        <div>
          <textarea
            value={card}
            onChange={(e) => setCard(e.target.value)}
            className='p-1 w-full rounded-md outline-none bg-white'
            placeholder='Enter Card Title...'
            cols={30}
            rows={2}
          ></textarea>
          <div className='flex p-1'>
            <button onClick={saveCard} className='p-2 rounded bg-[#0c66e4] text-white mr-2'>
              Add Card
            </button>
            <button onClick={closeBtn} className='p-1 rounded hover:bg-gray-300'>
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      {!show && (
        <button
          onClick={() => setShow(true)}
          className='flex p-1 w-full justify-start rounded items-center mt-1 hover:bg-gray-300 h-8'
        >
          <Plus size={16} />
          Add a Card
        </button>
      )}
    </div>
  );
}

export default CardAdd;