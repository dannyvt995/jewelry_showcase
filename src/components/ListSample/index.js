"use client"

import React, { useState, useRef, useEffect } from "react";

import ViewDrei from '../../jewelryModuleProgress/ViewDrei'
import {listModels} from '../../data/all_props'

import s from './style.module.css'


const ListSample = React.memo(() => {
  console.log("LiseItem render")

  const [selectedItem, setSelectedItem] = useState(null);

  const openModal = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Sample List</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listModels.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-white border-2 border-gray-200 rounded-xl shadow-xl transform transition duration-300 hover:scale-105 cursor-pointer"
            onClick={() => openModal(item)}
          >
            <h2 className="text-2xl font-semibold text-gray-800">{item.title}</h2>
            <p className="mt-2 text-gray-600 text-sm">{item.content}</p>
          </div>
        ))}
      </div>


      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${s.modalView} bg-white p-8 rounded-xl shadow-2xl`} id="modeView">
            <h2 className="text-3xl font-bold text-gray-800">{selectedItem.title}</h2>
            <p className="mt-4 text-gray-700">{selectedItem.content}</p>
            <ViewDrei modelId={selectedItem.modelId}/>

            <button
              onClick={closeModal}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>

  )
})

export default ListSample