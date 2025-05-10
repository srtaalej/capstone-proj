import React from 'react';
import { Poll, Option } from '@/app/types/poll';
import { useEffect, useState } from 'react';
import { createClient } from '@/app/lib/client';
import { BsThreeDotsVertical, BsClipboard2, BsClipboard2Check } from "react-icons/bs";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

const supabase = createClient();

interface PublicPollResultsProps {
  poll: Poll
}


export default function PollCard({ poll }: PublicPollResultsProps) {
    const [options, setOptions] = useState(poll.options); // Local state for options
    const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Subscribe to changes in the `options` table for this poll
    const channel = supabase
      .channel(`poll-${poll.id}`) // Unique channel for this poll
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Listen for updates
          schema: 'public',
          table: 'options',
          filter: `poll_id=eq.${poll.id}`, // Only listen for changes to this poll's options
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          const updatedOption = payload.new as Option;

          // Update the specific option in the local state
          setOptions((prevOptions) =>
            prevOptions.map((option) =>
              option.poll_id === updatedOption.poll_id ? updatedOption : option
            )
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [poll.id]);
  {new Date(poll.end_date).toLocaleString()}
        return (
  
            <div className="col-span-1 flex flex-col bg-gray-800 p-6 hover:bg-gray-700/70 transition-colors rounded-2xl" 
              onClick={( ) => {
                  window.location.href = `/polls/${poll.id}`;
              }}
            >
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white mb-2">{poll.title}</h3>
              <div className="relative inline-block text-left">
              <Menu>
                <MenuButton onClick={(e) => {
                    e.stopPropagation();
                  }}>
                  <BsThreeDotsVertical color='white'/>
                </MenuButton>

                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-gray-500 shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in">
                  
                  <div className="py-1">
                      {showNotification && (
                        <div className="fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50">
                            <BsClipboard2Check/>
                            Link copied to clipboard!
                        </div>
                      )}
                    <MenuItem>
                      
                      <div className='flex items-center justify-between p-2 text-sm text-white'>
                       <BsClipboard2/>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                      
                            const baseUrl = window.location.origin;
                            const pollUrl = `${baseUrl}/polls/${poll.id}`;
                            
                            navigator.clipboard.writeText(pollUrl)
                              .then(() => {
                                close();
                                setShowNotification(true);
                                setTimeout(() => setShowNotification(false), 2000);
                              })
                              .catch(err => {
                                console.error('Failed to copy: ', err);
                              });
                          }}
                          className='px-2'
                        >
                          Share
                        </button>
                      </div>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
              </div>
              </div>
              
              <div className="flex flex-col flex-grow">
                <p className="text-md text-gray-300 mb-4">{poll.description}</p>
                <div className="mt-auto flex items-center">
                  <div className="flex items-center text-sm text-gray-400">
                    <span className={`mr-1 ${
                        new Date(poll.end_date) < new Date() 
                            ? 'text-red-500' 
                            : 'text-green-500'
                        }`}>
                      {new Date(poll.end_date) < new Date() 
                        ? 'Ended' 
                        : `Ends ${new Date(poll.end_date).toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
    )     
};
