import React, { useContext, useState } from 'react'
import ChatArea from '../components/ChatArea'
import RightSidebar from '../components/RightSidebar'
import Sidebar from '../components/Sidebar'
import ChatContext from '../../Context/ChatContext'

const Homepage = () => {
  const {selectedUser} = useContext(ChatContext);
  return (
    <div className='w-full h-screen sm:px-[15%] sm:py-[5%]'>
      <div className={`backdrop-blur-xl border-2 border-gray-400 rounded-2xl
      overflow-hidden h-[100%] grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]':'md:grid-cols-2'}`}>
        <Sidebar />
        <ChatArea/>
        <RightSidebar/>
      </div>
    </div>
  )
}

export default Homepage