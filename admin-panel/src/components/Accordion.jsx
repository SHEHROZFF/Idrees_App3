// src/components/Accordion.jsx

import React, { useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

const Accordion = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-300 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left focus:outline-none"
      >
        <span className="text-xl font-medium text-gray-800">{question}</span>
        {isOpen ? <IoChevronUp size={24} /> : <IoChevronDown size={24} />}
      </button>
      {isOpen && (
        <div className="mt-2 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
};

export default Accordion;
